Your admin terminal credential manager has been configured and tested. It provides full
  lifecycle management (seed, create, update, delete, delete all, and verify) directly through
  terminal commands and synchronizes with .admin-credentials.json and MongoDB (admin_credentials
  collection).
  ──────
  ### 1. Verify Credentials (npx verify)

  Run the exact command you specified:

    npx verify --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"

  (Returns 0 exit code and ✓ VERIFIED: ADMIN CREDENTIALS ARE VALID! on match, or 1 with error on
  failure).
  ──────
  ### 2. Seed Default Admin Credentials

    npx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"
  ──────
  ### 3. Create a New Admin Account

    npx admin-auth create --email "admin@example.com" --password "SecretPass123" --name "Neeraj
    Rekwar" --role "Super Admin"
  ──────
  ### 4. Update Existing Admin Credentials

    npx admin-auth update --email "neerajrekwar817@gmail.com" --password "NewStrongPassword"
  ──────
  ### 5. Delete an Admin Account

    npx admin-auth delete --email "admin@example.com"
  ──────
  ### 6. Delete All Admin Accounts

    npx admin-auth delete all

  (Also accepts npx admin-auth delete-all).
  