import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClient';

export interface DisruptionReportRequest {
  route_number: string;
  location: string;
  severity: string;
  description: string;
  disruption: string; // This maps to the 'type' field in the form
  user_id: string;
}

export interface DisruptionReportResponse {
  id: string;
  route_number: string;
  location: string;
  severity: string;
  description: string;
  disruption: string;
  created_at: string;
  user_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DisruptionReportRequest = await request.json();
    
    const {
      route_number,
      location,
      severity,
      description,
      disruption,
      user_id
    } = body;

    // Validate required fields
    if (!route_number || !location || !severity || !description || !disruption || !user_id) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate severity values
    const validSeverities = ['low', 'medium', 'high'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity level' },
        { status: 400 }
      );
    }

    // Validate disruption types
    const validDisruptionTypes = ['delay', 'cancellation', 'service_change', 'track_work', 'other'];
    if (!validDisruptionTypes.includes(disruption)) {
      return NextResponse.json(
        { error: 'Invalid disruption type' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if there's already an active disruption for the same route and location
    // Skip this check if the table doesn't have the expected columns
    let existingDisruptions: any[] = [];
    try {
      const { data: checkData, error: checkError } = await supabase
        .from('disruption-report')
        .select('*')
        .eq('route_number', route_number)
        .eq('location', location)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24 hours
        .order('created_at', { ascending: false })
        .limit(1);

      if (checkError) {
        console.warn('Could not check for existing disruptions (table may not exist):', checkError.message);
        // Continue without duplicate check
      } else {
        existingDisruptions = checkData || [];
      }
    } catch (error) {
      console.warn('Error checking existing disruptions, continuing anyway:', error);
    }

    // If there's a recent duplicate report, return an error (only if we could check)
    if (existingDisruptions.length > 0) {
      return NextResponse.json(
        { error: 'You have already reported a disruption for this route and location recently. Please wait before submitting another report.' },
        { status: 409 }
      );
    }

    // Insert new disruption report
    const insertData: any = {
      route_number,
      location,
      severity,
      description,
      disruption,
      created_at: new Date().toISOString()
    };

    // Only include user_id if the column exists
    try {
      const { data, error } = await supabase
        .from('disruption-report')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting disruption report:', error);
        
        // If user_id column doesn't exist, try without it
        if (error.message.includes('user_id')) {
          console.log('Retrying insert without user_id column...');
          const { data: retryData, error: retryError } = await supabase
            .from('disruption-report')
            .insert([insertData])
            .select()
            .single();

          if (retryError) {
            console.error('Error inserting disruption report (retry):', retryError);
            return NextResponse.json(
              { error: `Failed to submit disruption report: ${retryError.message}` },
              { status: 500 }
            );
          }

          return NextResponse.json({
            message: 'Disruption report submitted successfully',
            data: retryData as DisruptionReportResponse
          });
        }

        return NextResponse.json(
          { error: `Failed to submit disruption report: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Disruption report submitted successfully',
        data: data as DisruptionReportResponse
      });
    } catch (insertError) {
      console.error('Unexpected error during insert:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit disruption report due to unexpected error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Disruption report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching disruptions...');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const route = searchParams.get('route');
    const severity = searchParams.get('severity');
    const disruption_type = searchParams.get('disruption_type');

    const supabase = getSupabaseClient();
    console.log('Supabase client initialized');

    // First, let's check if the table exists and what columns it has
    let query = supabase
      .from('disruption-report')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (route) {
      query = query.eq('route_number', route);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (disruption_type) {
      query = query.eq('disruption', disruption_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching disruptions:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Failed to fetch disruptions: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data?.length || 0} disruptions from database`);

    // Process disruptions and handle missing columns gracefully
    const disruptionsWithUsers = (data || []).map((disruption: any) => ({
      id: disruption.id || 'unknown',
      route_number: disruption.route_number || disruption.route || 'Unknown',
      location: disruption.location || 'Unknown location',
      severity: disruption.severity || 'low',
      description: disruption.description || 'No description',
      disruption: disruption.disruption || disruption.type || 'other',
      created_at: disruption.created_at || new Date().toISOString(),
      user_id: disruption.user_id || 'anonymous',
      reported_by: 'User', // Generic user name since we can't access auth.users
      reported_by_email: null
    }));

    return NextResponse.json({
      disruptions: disruptionsWithUsers,
      total: disruptionsWithUsers.length
    });

  } catch (error) {
    console.error('Fetch disruptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
