import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClient';

export interface ConfirmDisruptionRequest {
  disruption_id: string;
  user_id: string;
  severity?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmDisruptionRequest = await request.json();
    
    const {
      disruption_id,
      user_id,
      severity,
      description
    } = body;

    if (!disruption_id || !user_id) {
      return NextResponse.json(
        { error: 'Disruption ID and user ID are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if user has already confirmed this disruption
    const { data: existingConfirmation, error: checkError } = await supabase
      .from('disruption-report')
      .select('id')
      .eq('id', disruption_id)
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing confirmation:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing confirmation' },
        { status: 500 }
      );
    }

    if (existingConfirmation) {
      return NextResponse.json(
        { error: 'You have already confirmed this disruption' },
        { status: 409 }
      );
    }

    // Get the original disruption to update severity/description if needed
    const { data: originalDisruption, error: fetchError } = await supabase
      .from('disruption-report')
      .select('*')
      .eq('id', disruption_id)
      .single();

    if (fetchError) {
      console.error('Error fetching original disruption:', fetchError);
      return NextResponse.json(
        { error: 'Disruption not found' },
        { status: 404 }
      );
    }

    // Determine if we should update severity or description
    let updateData: any = {};
    
    if (severity && severity !== originalDisruption.severity) {
      // Update to higher severity if needed
      const severityLevels = { low: 1, medium: 2, high: 3 };
      const currentLevel = severityLevels[originalDisruption.severity as keyof typeof severityLevels] || 1;
      const newLevel = severityLevels[severity as keyof typeof severityLevels] || 1;
      
      if (newLevel > currentLevel) {
        updateData.severity = severity;
      }
    }

    if (description && description.length > originalDisruption.description.length) {
      updateData.description = description;
    }

    // Create a new confirmation record (this represents a user confirming an existing disruption)
    const { data: confirmationData, error: insertError } = await supabase
      .from('disruption-report')
      .insert([
        {
          route_number: originalDisruption.route_number,
          location: originalDisruption.location,
          severity: updateData.severity || originalDisruption.severity,
          description: updateData.description || originalDisruption.description,
          disruption: originalDisruption.disruption,
          user_id
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating confirmation:', insertError);
      return NextResponse.json(
        { error: 'Failed to confirm disruption' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Disruption confirmed successfully',
      data: confirmationData
    });

  } catch (error) {
    console.error('Confirm disruption error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
