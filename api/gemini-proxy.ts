/**
 * Gemini API Proxy - Vercel Serverless Function
 * 
 * This proxy protects the Gemini API key from being exposed in the frontend.
 * It handles all AI generation requests securely on the server side.
 * 
 * Environment Variables Required:
 * - GEMINI_API_KEY: Your Google Gemini API key
 * 
 * Usage:
 * POST /api/gemini-proxy
 * Body: { prompt: string, model?: string, systemInstruction?: string }
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure for Edge runtime (faster cold starts)
export const config = {
  runtime: 'edge',
  maxDuration: 30, // 30 seconds timeout
};

// CORS headers for security
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

/**
 * Main handler function
 */
export default async function handler(req: Request) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Method not allowed. Use POST.' 
      }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    const { prompt, model = 'gemini-2.0-flash-exp', systemInstruction } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Valid prompt is required' 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Server configuration error' 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ 
      model,
      systemInstruction: systemInstruction || 'You are a helpful assistant for the GMEL Technology Ecosystem.'
    });

    // Generate content
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true,
        text,
        model,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Handle specific error types
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key configuration';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded';
      statusCode = 429;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout';
      statusCode = 408;
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
      }),
      { status: statusCode, headers: corsHeaders }
    );
  }
}
