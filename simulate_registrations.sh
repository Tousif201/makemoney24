#!/bin/bash

# --- Configuration ---
REGISTER_ENDPOINT="http://localhost:3000/api/auth/register"
UPGRADE_BASE_ENDPOINT="http://localhost:3000/api/users/upgrade" # Will append userId
NUM_USERS_TO_REGISTER=30
DELAY_SECONDS=1 # Delay between registrations in seconds

# Membership details for upgrade
MEMBERSHIP_AMOUNT=1299
MEMBERSHIP_PACKAGE_ID="684940a9bb87754e8383ebc0"

# --- Prerequisites Check ---
if ! command -v curl &> /dev/null; then
    echo "Error: 'curl' is not installed. Please install it to run this script."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed. Please install it to parse JSON responses."
    echo "  On Debian/Ubuntu: sudo apt-get install jq"
    echo "  On macOS (using Homebrew): brew install jq"
    exit 1
fi

# --- Data ---
INDIAN_FIRST_NAMES=( "Rahul" "Priya" "Amit" "Sneha" "Rajesh" "Pooja" "Suresh" "Kavita" "Ashish" "Deepa" "Vikas" "Shweta" "Anil" "Meena" "Gopal" "Rina" "Ajay" "Nisha" "Manoj" "Sarita" "Arjun" "Kiran" "Dinesh" "Seema" "Gaurav" "Anita" "Vivek" "Preeti" "Alok" "Mamta" )
INDIAN_LAST_NAMES=( "Kumar" "Singh" "Sharma" "Yadav" "Patel" "Gupta" "Reddy" "Mehta" "Shah" "Jain" "Khan" "Malik" "Verma" "Dubey" "Rao" "Nair" "Pillai" "Choudhary" "Thakur" "Saini" "Goyal" "Mishra" "Das" "Roy" )

declare -a REGISTERED_USER_EMAILS=()
declare -a AVAILABLE_REFERRERS_QUEUE=()
declare -A REFERRER_CHILD_COUNT=()

# --- Helpers ---
generate_indian_name() {
    local fn_idx=$(( RANDOM % ${#INDIAN_FIRST_NAMES[@]} ))
    local ln_idx=$(( RANDOM % ${#INDIAN_LAST_NAMES[@]} ))
    echo "${INDIAN_FIRST_NAMES[$fn_idx]} ${INDIAN_LAST_NAMES[$ln_idx]}"
}

generate_indian_phone_number() {
    local prefix=$(shuf -n 1 -e 6 7 8 9)
    local suffix=$(head /dev/urandom | tr -dc 0-9 | head -c 9)
    echo "${prefix}${suffix}"
}

generate_pincode() {
    local first_digit=$(shuf -n 1 -e 1 2 3 4 5 6 7 8)
    local suffix=$(head /dev/urandom | tr -dc 0-9 | head -c 5)
    echo "${first_digit}${suffix}"
}

generate_unique_email() {
    local base=$(echo "$1" | tr -d ' ' | tr '[:upper:]' '[:lower:]' | head -c 10)
    local count=0
    local email=""
    while true; do
        email="${base}${count}@gmail.com"
        if [[ ! " ${REGISTERED_USER_EMAILS[*]} " =~ " ${email} " ]]; then
            echo "$email"
            return
        fi
        ((count++))
    done
}

# --- Main ---
echo "--- Starting Registration & Upgrade Simulation ---"

for (( i=1; i<=NUM_USERS_TO_REGISTER; i++ )); do
    NAME=$(generate_indian_name)
    EMAIL=$(generate_unique_email "$NAME")
    PHONE=$(generate_indian_phone_number)
    PASSWORD="Password123!"
    PINCODE=$(generate_pincode)
    REFERRED_BY_CODE_TO_SEND="null"

    if (( ${#AVAILABLE_REFERRERS_QUEUE[@]} > 0 )); then
        REFERRED_BY_CODE_TO_SEND="${AVAILABLE_REFERRERS_QUEUE[0]}"
        REFERRER_CHILD_COUNT["$REFERRED_BY_CODE_TO_SEND"]=$(( REFERRER_CHILD_COUNT["$REFERRED_BY_CODE_TO_SEND"] + 1 ))
        if (( REFERRER_CHILD_COUNT["$REFERRED_BY_CODE_TO_SEND"] >= 2 )); then
            AVAILABLE_REFERRERS_QUEUE=("${AVAILABLE_REFERRERS_QUEUE[@]:1}")
        fi
    fi

    JSON_PAYLOAD_REGISTER=$(jq -n \
        --arg name "$NAME" \
        --arg email "$EMAIL" \
        --arg phone "$PHONE" \
        --arg password "$PASSWORD" \
        --arg pincode "$PINCODE" \
        --arg refCodeStr "$REFERRED_BY_CODE_TO_SEND" \
        '{
          name: $name,
          email: $email,
          phone: $phone,
          password: $password,
          pincode: $pincode,
          isMember: false,
          roles: ["user"],
          referredByCode: ($refCodeStr | if . == "null" then null else . end)
        }')

    echo -e "\n--- User ${i}/${NUM_USERS_TO_REGISTER} (Registration) ---"
    echo "Registering: $EMAIL"

    HTTP_STATUS_REGISTER=$(curl -s -o /tmp/curl_response_register.txt -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD_REGISTER" \
        "$REGISTER_ENDPOINT")
    RESPONSE_REGISTER=$(cat /tmp/curl_response_register.txt)
    rm -f /tmp/curl_response_register.txt

    USER_ID=$(echo "$RESPONSE_REGISTER" | jq -r '.user._id // empty')
    NEW_REFERRAL_CODE=$(echo "$RESPONSE_REGISTER" | jq -r '.user.referralCode // empty')

    if [[ "$HTTP_STATUS_REGISTER" -ge 200 && "$HTTP_STATUS_REGISTER" -lt 300 && -n "$USER_ID" ]]; then
        echo "✅ Registered: $USER_ID with referral code: $NEW_REFERRAL_CODE"
        REGISTERED_USER_EMAILS+=("$EMAIL")
        AVAILABLE_REFERRERS_QUEUE+=("$NEW_REFERRAL_CODE")
        REFERRER_CHILD_COUNT["$NEW_REFERRAL_CODE"]=0
    else
        echo "❌ Registration failed for $EMAIL"
        echo "Response: $RESPONSE_REGISTER"
        sleep "$DELAY_SECONDS"
        continue
    fi

    # --- Upgrade Step ---
    echo "--- Upgrading User: $USER_ID ---"

    CASHFREE_ORDER_ID="CF-ORDER-$(date +%s%N | cut -b1-13)-$((RANDOM % 10000))"
    echo "Generated CashFree Order ID: $CASHFREE_ORDER_ID"

    JSON_PAYLOAD_UPGRADE=$(jq -n \
        --arg amount "$MEMBERSHIP_AMOUNT" \
        --arg packageId "$MEMBERSHIP_PACKAGE_ID" \
        --arg cfOrderId "$CASHFREE_ORDER_ID" \
        '{
          membershipAmount: ($amount | tonumber),
          membershipPackageId: $packageId,
          cashFreeOrderId: $cfOrderId
        }')

    UPGRADE_ENDPOINT="${UPGRADE_BASE_ENDPOINT}/${USER_ID}"
    HTTP_STATUS_UPGRADE=$(curl -s -o /tmp/curl_response_upgrade.txt -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD_UPGRADE" \
        "$UPGRADE_ENDPOINT")
    RESPONSE_UPGRADE=$(cat /tmp/curl_response_upgrade.txt)
    rm -f /tmp/curl_response_upgrade.txt

    if [[ "$HTTP_STATUS_UPGRADE" -ge 200 && "$HTTP_STATUS_UPGRADE" -lt 300 ]]; then
        echo "✅ Upgrade successful for $USER_ID"
    else
        echo "❌ Upgrade failed for $USER_ID"
        echo "Response: $RESPONSE_UPGRADE"
    fi

    sleep "$DELAY_SECONDS"
done

echo -e "\n--- Simulation Complete ---"
echo "Registered and upgraded $NUM_USERS_TO_REGISTER users."
