import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// GET: Fetch full account details for custom form
export async function GET(request: NextRequest) {
  try {
    const accountId = request.headers.get("x-stripe-account");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    console.log("Fetching account details for:", accountId);

    const account = await stripe.accounts.retrieve(accountId, {
      expand: ["capabilities", "requirements", "external_accounts"],
    });

    // Format response with all editable fields
    const accountDetails = {
      id: account.id,
      type: account.type,
      country: account.country,
      default_currency: account.default_currency,
      email: account.email,

      // Business Profile
      business_profile: {
        name: account.business_profile?.name || "",
        url: account.business_profile?.url || "",
        support_email: account.business_profile?.support_email || "",
        support_phone: account.business_profile?.support_phone || "",
        support_url: account.business_profile?.support_url || "",
        mcc: account.business_profile?.mcc || "",
        product_description: account.business_profile?.product_description || "",
      },

      // Business Type
      business_type: account.business_type || "individual",

      // Individual (for individual accounts)
      individual: account.individual ? {
        first_name: account.individual.first_name || "",
        last_name: account.individual.last_name || "",
        email: account.individual.email || "",
        phone: account.individual.phone || "",
        dob: account.individual.dob ? {
          day: account.individual.dob.day,
          month: account.individual.dob.month,
          year: account.individual.dob.year,
        } : null,
        address: account.individual.address ? {
          line1: account.individual.address.line1 || "",
          line2: account.individual.address.line2 || "",
          city: account.individual.address.city || "",
          state: account.individual.address.state || "",
          postal_code: account.individual.address.postal_code || "",
          country: account.individual.address.country || "",
        } : null,
        ssn_last_4_provided: account.individual.ssn_last_4_provided || false,
        id_number_provided: account.individual.id_number_provided || false,
      } : null,

      // Company (for company accounts)
      company: account.company ? {
        name: account.company.name || "",
        phone: account.company.phone || "",
        tax_id_provided: account.company.tax_id_provided || false,
        address: account.company.address ? {
          line1: account.company.address.line1 || "",
          line2: account.company.address.line2 || "",
          city: account.company.address.city || "",
          state: account.company.address.state || "",
          postal_code: account.company.address.postal_code || "",
          country: account.company.address.country || "",
        } : null,
      } : null,

      // Capabilities
      capabilities: account.capabilities || {},
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,

      // Requirements
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
        pending_verification: account.requirements?.pending_verification || [],
        disabled_reason: account.requirements?.disabled_reason || null,
        errors: account.requirements?.errors || [],
      },

      // External Accounts (Bank accounts)
      external_accounts: account.external_accounts?.data?.map((ea: any) => ({
        id: ea.id,
        object: ea.object,
        bank_name: ea.bank_name,
        last4: ea.last4,
        currency: ea.currency,
        country: ea.country,
        default_for_currency: ea.default_for_currency,
        status: ea.status,
      })) || [],

      // Metadata
      metadata: account.metadata || {},
      created: account.created,
    };

    return NextResponse.json(accountDetails);
  } catch (error: any) {
    console.error("Error fetching account details:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update account details
export async function PUT(request: NextRequest) {
  try {
    const accountId = request.headers.get("x-stripe-account");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Updating account:", accountId, body);

    // Build update params
    const updateParams: any = {};

    // Business Type (can be changed for Custom accounts)
    if (body.business_type) {
      updateParams.business_type = body.business_type;
    }

    // Business Profile
    if (body.business_profile) {
      updateParams.business_profile = {};
      if (body.business_profile.name !== undefined) {
        updateParams.business_profile.name = body.business_profile.name;
      }
      if (body.business_profile.url !== undefined) {
        updateParams.business_profile.url = body.business_profile.url || null;
      }
      if (body.business_profile.support_email !== undefined) {
        updateParams.business_profile.support_email = body.business_profile.support_email || null;
      }
      if (body.business_profile.support_phone !== undefined) {
        updateParams.business_profile.support_phone = body.business_profile.support_phone || null;
      }
      if (body.business_profile.product_description !== undefined) {
        updateParams.business_profile.product_description = body.business_profile.product_description || null;
      }
      if (body.business_profile.mcc !== undefined) {
        updateParams.business_profile.mcc = body.business_profile.mcc;
      }
    }

    // Individual
    if (body.individual) {
      updateParams.individual = {};
      if (body.individual.first_name !== undefined) {
        updateParams.individual.first_name = body.individual.first_name;
      }
      if (body.individual.last_name !== undefined) {
        updateParams.individual.last_name = body.individual.last_name;
      }
      if (body.individual.email !== undefined) {
        updateParams.individual.email = body.individual.email;
      }
      if (body.individual.phone !== undefined) {
        updateParams.individual.phone = body.individual.phone;
      }
      if (body.individual.dob) {
        updateParams.individual.dob = body.individual.dob;
      }
      if (body.individual.address) {
        updateParams.individual.address = body.individual.address;
      }
      if (body.individual.ssn_last_4 !== undefined) {
        updateParams.individual.ssn_last_4 = body.individual.ssn_last_4;
      }
    }

    // Company
    if (body.company) {
      updateParams.company = {};
      if (body.company.name !== undefined) {
        updateParams.company.name = body.company.name;
      }
      if (body.company.phone !== undefined) {
        updateParams.company.phone = body.company.phone;
      }
      if (body.company.address) {
        updateParams.company.address = body.company.address;
      }
      if (body.company.tax_id !== undefined) {
        updateParams.company.tax_id = body.company.tax_id;
      }
    }

    // Email
    if (body.email !== undefined) {
      updateParams.email = body.email;
    }

    // Metadata
    if (body.metadata !== undefined) {
      updateParams.metadata = body.metadata;
    }

    const account = await stripe.accounts.update(accountId, updateParams);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        business_profile: account.business_profile,
        individual: account.individual,
        company: account.company,
      },
    });
  } catch (error: any) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
