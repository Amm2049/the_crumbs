import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { NextResponse } from "next/server"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// no repeating NextResponse.json in API routes
export const response = (data,status=200)=>NextResponse.json(data,{status});

//functions to handle the api errors
export function handleApiError(error,messages={})
{
  //P2002 for already exists
  if(error.code === 'P2002')return  response({error:messages.P2002 || 'Record already in use'},409)

  //P2025 for not found
  if(error.code === 'P2025')return response({error: messages.P2025 || 'Record not found'},404)

  return response({error: error.message || 'Something went wrong'},500)
}
