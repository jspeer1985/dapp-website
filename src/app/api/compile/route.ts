import { NextRequest, NextResponse } from 'next/server';
import { DeterministicDAppCompiler } from '@/lib/compiler/DeterministicCompiler';
import type { ProjectConfig } from '@/lib/compiler/types';

export async function POST(request: Request) {
  try {
    const config: ProjectConfig = await request.json();
    
    const compiler = new DeterministicDAppCompiler(config);
    const result = await compiler.compile();
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Compilation failed', details: result.errors },
        { status: 400 }
      );
    }
    
    // Convert blob to base64 for transport
    const arrayBuffer = await result.zipBlob!.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return NextResponse.json({
      success: true,
      zipData: base64,
      fileCount: result.fileCount
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', message: String(error) },
      { status: 500 }
    );
  }
}
