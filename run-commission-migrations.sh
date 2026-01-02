#!/bin/bash

# This script runs the commission rates setup and enrollment pricing update migrations
# You'll need to run these through the Supabase dashboard or use psql

echo "Commission Rates Setup Migration:"
echo "================================"
echo ""
echo "1. Open your Supabase dashboard"
echo "2. Go to SQL Editor"
echo "3. Create a new query and paste the content of: database/create-commission-rates.sql"
echo "4. Run the query"
echo ""
echo "5. Then create another query and paste: database/update-enrollments-pricing.sql"
echo "6. Run that query"
echo ""
echo "This will:"
echo "  - Create commission_rates table with admin-configurable rates"
echo "  - Set default platform rate to 20%"
echo "  - Add pricing fields to enrollments table"
echo "  - Enable RLS policies for commission management"
