import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import fs from "fs";
import path from "path";

const DEMO_ACCOUNTS_FILE = path.join(process.cwd(), "data", "demo-accounts.json");

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DEMO_ACCOUNTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read existing demo accounts
function readDemoAccounts(): Array<{
  accountId: string;
  createdAt: string;
  email: string;
  businessName: string;
}> {
  ensureDataDir();
  if (!fs.existsSync(DEMO_ACCOUNTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DEMO_ACCOUNTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save demo accounts
function saveDemoAccounts(accounts: Array<{
  accountId: string;
  createdAt: string;
  email: string;
  businessName: string;
}>) {
  ensureDataDir();
  fs.writeFileSync(DEMO_ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

export async function POST() {
  try {
    // Generate unique email and business name
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const email = `demo-${timestamp}-${randomId}@furever-demo.com`;
    const businessName = `Furever Demo ${randomId.toUpperCase()}`;

    console.log("Creating new demo account:", { email, businessName });

    // Create Custom connected account (allows full embedded component access)
    // Note: Do NOT use `type` parameter together with `controller` - they are mutually exclusive
    const account = await stripe.accounts.create({
      country: "US",
      email: email,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      // Controller settings - platform handles everything (implicitly creates custom account)
      controller: {
        // Platform handles verification requirements
        requirement_collection: "application",
        // Platform handles payment disputes and losses
        losses: {
          payments: "application",
        },
        // Platform handles fees
        fees: {
          payer: "application",
        },
        // No Stripe Dashboard access for the connected account
        stripe_dashboard: {
          type: "none",
        },
      },
    });

    console.log("Demo account created:", account.id);

    // Save to JSON file
    const accounts = readDemoAccounts();
    accounts.push({
      accountId: account.id,
      createdAt: new Date().toISOString(),
      email: email,
      businessName: businessName,
    });
    saveDemoAccounts(accounts);

    return NextResponse.json({
      success: true,
      accountId: account.id,
      email: email,
      businessName: businessName,
      type: "demo",
    });
  } catch (error: any) {
    console.error("Error creating demo account:", error);
    return NextResponse.json(
      {
        error: error.message,
        type: error.type,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

// GET: List all demo accounts
export async function GET() {
  try {
    const accounts = readDemoAccounts();
    return NextResponse.json({
      success: true,
      accounts: accounts,
      total: accounts.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
