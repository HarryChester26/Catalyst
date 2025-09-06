import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    const supabase = getSupabaseClient();
    console.log('Supabase client initialized');

    // Test basic connection by trying to select from the table
    const { data, error } = await supabase
      .from('disruption-report')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log('Database connection test successful');
    return NextResponse.json({
      success: true,
      message: 'Database connection is working',
      data: data
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test database connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
