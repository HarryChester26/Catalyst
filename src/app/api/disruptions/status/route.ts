import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Test if the table exists by trying to query it
    const { data, error } = await supabase
      .from('disruption-report')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: 'table_not_found',
        message: 'The disruption-report table does not exist',
        error: error.message,
        setup_required: true,
        setup_instructions: 'Run the database-setup.sql script in your Supabase SQL editor'
      });
    }

    // If we get here, the table exists
    const { count } = await supabase
      .from('disruption-report')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      status: 'ready',
      message: 'Database is ready',
      table_exists: true,
      total_records: count || 0
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      setup_required: true
    });
  }
}
