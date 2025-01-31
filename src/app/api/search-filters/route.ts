import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const filters = await request.json();
    //http://18.232.61.185:8000/scrape
    //https://airbnb-booking-com-scraper.onrender.com/scrape
    //http://localhost:8000/scrape
    //https://7dc9-119-73-100-76.ngrok-free.app
    // Forward the filters to the FastAPI backend
    const response = await fetch(
      "https://airbnb-booking-com-scraper.onrender.com/scrape",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      }
    );

    if (!response.ok) {
      throw new Error(`Backend server error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error forwarding to backend:", error);
    return NextResponse.json(
      { error: "Failed to process filters" },
      { status: 500 }
    );
  }
}
