#!/run/current-system/sw/bin/bash

# Script to set up GitHub environment secrets and variables for lza-prod
# Repository: bcgov/parks-data-register
# Environment: lza-prod

# Note: The environment must be created first via GitHub web UI or API
# Go to: https://github.com/bcgov/parks-data-register/settings/environments
# Click "New environment" and name it "lza-prod"

REPO="bcgov/parks-data-register"
ENV="lza-prod"

################################################################################
# CONFIGURATION SECTION - UPDATE THESE VALUES FOR YOUR LZA PRODUCTION ENVIRONMENT
################################################################################

# VARIABLES - LZA Production specific values
LZA_ACCOUNT_ID="183300739488"
LZA_AWS_REGION="ca-central-1"

# SECRETS - These values are sensitive and will be encrypted
AWS_ROLE_TO_ASSUME="arn:aws:iam::${LZA_ACCOUNT_ID}:role/GitHub-OIDC-Role"

# VARIABLES - Derived from LZA_ACCOUNT_ID and LZA_AWS_REGION
LZA_KMS_KEY_ARN="arn:aws:kms:${LZA_AWS_REGION}:${LZA_ACCOUNT_ID}:alias/aws/es"

# VARIABLES - SSO Configuration (PRODUCTION Keycloak)
SSO_ISSUER="https://loginproxy.gov.bc.ca/auth/realms/bcparks-service-transformation"
SSO_JWKSURI="https://loginproxy.gov.bc.ca/auth/realms/bcparks-service-transformation/protocol/openid-connect/certs"

# VARIABLES - API Configuration
PDR_API_DIRECTORY="pdr-api"
PDR_API_STACK_NAME="pdr-api-lza-prod"
PDR_API_STAGE="lza-prod"
ENVIRONMENT_STAGE="lza-prod"
EBS_IOPS="3000"
OPENSEARCH_DOMAIN_NAME="pdr-opensearch"
TABLE_NAME_REGISTER="NameRegister-lza-prod"
TABLE_NAME_AUDIT="Audit-lza-prod"

# VARIABLES - Admin Configuration
PDR_ADMIN_DIRECTORY="pdr-admin"
PDR_ADMIN_STACK_NAME="pdr-admin-lza-prod"
PDR_ADMIN_PROJECT_NAME="pdr-admin-lza-prod"

# VARIABLES - These will be set after deployment
PDR_API_ID=""  # ⚠️ Set after API deployment: gh variable set PDR_API_ID --repo $REPO --env $ENV --body "<api-gateway-id>"

# VARIABLES - Domain Configuration (OPTIONAL - leave empty for CloudFront default)
DOMAIN_NAME=""  # e.g., "data.bcparks.ca" or leave empty for CloudFront default
CREATE_CERTIFICATE="false"  # Set to 'true' to auto-create certificate (requires HOSTED_ZONE_ID)
EXISTING_CERTIFICATE_ARN=""  # Only if using existing certificate with custom domain
HOSTED_ZONE_ID=""  # Only if CREATE_CERTIFICATE is 'true'

################################################################################
# END CONFIGURATION SECTION
################################################################################

echo "================================================================"
echo "Setting up environment secrets and variables for $ENV in $REPO"
echo "================================================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

echo "✓ GitHub CLI authenticated"
echo ""

# Set Environment Secrets
echo "Setting environment secrets..."
echo "------------------------------"

echo "Setting AWS_ROLE_TO_ASSUME..."
gh secret set AWS_ROLE_TO_ASSUME \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$AWS_ROLE_TO_ASSUME"

# Set Environment Variables
echo ""
echo "Setting environment variables..."
echo "--------------------------------"

# API Variables
echo "Setting PDR_API_DIRECTORY..."
gh variable set PDR_API_DIRECTORY \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$PDR_API_DIRECTORY"

echo "Setting AWS_REGION..."
gh variable set AWS_REGION \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$LZA_AWS_REGION"

echo "Setting PDR_API_STACK_NAME..."
gh variable set PDR_API_STACK_NAME \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$PDR_API_STACK_NAME"

echo "Setting PDR_API_STAGE..."
gh variable set PDR_API_STAGE \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$PDR_API_STAGE"

echo "Setting SSO_ISSUER..."
gh variable set SSO_ISSUER \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$SSO_ISSUER"

echo "Setting SSO_JWKSURI..."
gh variable set SSO_JWKSURI \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$SSO_JWKSURI"

echo "Setting KMS_KEY_ARN..."
gh variable set KMS_KEY_ARN \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$LZA_KMS_KEY_ARN"

echo "Setting ACCT_ID..."
gh variable set ACCT_ID \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$LZA_ACCOUNT_ID"

echo "Setting EBS_IOPS..."
gh variable set EBS_IOPS \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$EBS_IOPS"

echo "Setting ENVIRONMENT_STAGE..."
gh variable set ENVIRONMENT_STAGE \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$ENVIRONMENT_STAGE"

echo "Setting OPENSEARCH_DOMAIN_NAME..."
gh variable set OPENSEARCH_DOMAIN_NAME \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$OPENSEARCH_DOMAIN_NAME"

echo "Setting TABLE_NAME_REGISTER..."
gh variable set TABLE_NAME_REGISTER \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$TABLE_NAME_REGISTER"

echo "Setting TABLE_NAME_AUDIT..."
gh variable set TABLE_NAME_AUDIT \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$TABLE_NAME_AUDIT"

# Admin Variables
echo "Setting PDR_ADMIN_DIRECTORY..."
gh variable set PDR_ADMIN_DIRECTORY \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$PDR_ADMIN_DIRECTORY"

echo "Setting PDR_ADMIN_STACK_NAME..."
gh variable set PDR_ADMIN_STACK_NAME \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$PDR_ADMIN_STACK_NAME"

echo "Setting PDR_ADMIN_PROJECT_NAME..."
gh variable set PDR_ADMIN_PROJECT_NAME \
  --repo "$REPO" \
  --env "$ENV" \
  --body "$PDR_ADMIN_PROJECT_NAME"

# Optional: API Gateway ID (set after API deployment)
if [ -n "$PDR_API_ID" ]; then
    echo "Setting PDR_API_ID..."
    gh variable set PDR_API_ID \
        --repo "$REPO" \
        --env "$ENV" \
        --body "$PDR_API_ID"
else
    echo "⚠️  PDR_API_ID not set - you must set this after API deployment"
fi

# Optional: Domain configuration
if [ -n "$DOMAIN_NAME" ]; then
    echo "Setting DOMAIN_NAME..."
    gh variable set DOMAIN_NAME \
        --repo "$REPO" \
        --env "$ENV" \
        --body "$DOMAIN_NAME"
fi

if [ -n "$CREATE_CERTIFICATE" ] && [ "$CREATE_CERTIFICATE" != "false" ]; then
    echo "Setting CREATE_CERTIFICATE..."
    gh variable set CREATE_CERTIFICATE \
        --repo "$REPO" \
        --env "$ENV" \
        --body "$CREATE_CERTIFICATE"
fi

if [ -n "$EXISTING_CERTIFICATE_ARN" ]; then
    echo "Setting EXISTING_CERTIFICATE_ARN..."
    gh variable set EXISTING_CERTIFICATE_ARN \
        --repo "$REPO" \
        --env "$ENV" \
        --body "$EXISTING_CERTIFICATE_ARN"
fi

if [ -n "$HOSTED_ZONE_ID" ]; then
    echo "Setting HOSTED_ZONE_ID..."
    gh variable set HOSTED_ZONE_ID \
        --repo "$REPO" \
        --env "$ENV" \
        --body "$HOSTED_ZONE_ID"
fi

echo ""
echo "================================================================"
echo "✅ Setup complete!"
echo "================================================================"
echo ""
echo "Environment: $ENV"
echo "AWS Account: $LZA_ACCOUNT_ID"
echo "AWS Region: $LZA_AWS_REGION"
echo "Keycloak: https://loginproxy.gov.bc.ca/auth (PRODUCTION)"
echo ""
echo "📋 Secrets set:"
echo "  ✓ AWS_ROLE_TO_ASSUME"
echo ""
echo "📋 Variables set:"
echo "  API Configuration:"
echo "    ✓ PDR_API_DIRECTORY = $PDR_API_DIRECTORY"
echo "    ✓ PDR_API_STACK_NAME = $PDR_API_STACK_NAME"
echo "    ✓ PDR_API_STAGE = $PDR_API_STAGE"
echo "    ✓ ENVIRONMENT_STAGE = $ENVIRONMENT_STAGE"
echo "    ✓ AWS_REGION = $LZA_AWS_REGION"
echo "    ✓ SSO_ISSUER = $SSO_ISSUER"
echo "    ✓ SSO_JWKSURI = $SSO_JWKSURI"
echo "    ✓ KMS_KEY_ARN = $LZA_KMS_KEY_ARN"
echo "    ✓ ACCT_ID = $LZA_ACCOUNT_ID"
echo "    ✓ EBS_IOPS = $EBS_IOPS"
echo "    ✓ OPENSEARCH_DOMAIN_NAME = $OPENSEARCH_DOMAIN_NAME"
echo "    ✓ TABLE_NAME_REGISTER = $TABLE_NAME_REGISTER"
echo "    ✓ TABLE_NAME_AUDIT = $TABLE_NAME_AUDIT"
echo ""
echo "  Admin Configuration:"
echo "    ✓ PDR_ADMIN_DIRECTORY = $PDR_ADMIN_DIRECTORY"
echo "    ✓ PDR_ADMIN_STACK_NAME = $PDR_ADMIN_STACK_NAME"
echo "    ✓ PDR_ADMIN_PROJECT_NAME = $PDR_ADMIN_PROJECT_NAME"
echo ""
echo "⚠️  ACTION REQUIRED:"
echo ""
echo "1. First, create the GitHub environment 'lza-prod' if it doesn't exist:"
echo "   https://github.com/$REPO/settings/environments"
echo ""
echo "2. After deploying the API stack, set PDR_API_ID:"
echo "   gh variable set PDR_API_ID --repo $REPO --env $ENV --body \"<api-gateway-id>\""
echo ""
echo "3. Update pdr-admin/samconfig.toml with the API Gateway ID"
echo ""
echo "4. Deploy admin stack with git tag (e.g., v1.0.1)"
echo ""
echo "5. Create DynamoDB config item (see LZA-PROD-DEPLOYMENT.md Phase 4)"
echo ""
echo "6. Copy production data from j8tx58-prod:"
echo "   SOURCE_AWS_PROFILE=\"j8tx58-prod\" \\"
echo "   TARGET_AWS_PROFILE=\"183300739488_BCGOV_LZA_Admin\" \\"
echo "   TARGET_TABLE=\"NameRegister-lza-prod\" \\"
echo "   bash copy-data-to-lza.sh"
echo ""
echo "📚 For detailed deployment steps, see: LZA-PROD-DEPLOYMENT.md"
echo ""
echo "To verify current values:"
echo "  gh secret list --repo $REPO --env $ENV | cat"
echo "  gh variable list --repo $REPO --env $ENV | cat"
echo ""
