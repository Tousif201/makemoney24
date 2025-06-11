#!/bin/bash

# --- Configuration ---
REGISTER_ENDPOINT="http://localhost:3000/api/auth/register"
UPGRADE_BASE_ENDPOINT="http://localhost:3000/api/users/upgrade" # Will append userId
NUM_USERS_TO_REGISTER=30
DELAY_SECONDS=2 # Delay between registrations in seconds (e.g., 0.5 for 500ms)

# Membership details for upgrade
MEMBERSHIP_AMOUNT=5500
MEMBERSHIP_PACKAGE_ID="68431fa5aa515ab91c29f9b7"

# --- Prerequisites Check ---
# Ensure curl is installed for making HTTP requests
if ! command -v curl &> /dev/null
then
    echo "Error: 'curl' is not installed. Please install it to run this script."
    exit 1
fi

# Ensure jq is installed for parsing JSON responses
if ! command -v jq &> /dev/null
then
    echo "Error: 'jq' is not installed. Please install it to parse JSON responses."
    echo "  On Debian/Ubuntu: sudo apt-get install jq"
    echo "  On macOS (using Homebrew): brew install jq"
    exit 1
fi

# --- Data for generating Indian names ---
INDIAN_FIRST_NAMES=(
    "Rahul" "Priya" "Amit" "Sneha" "Rajesh" "Pooja" "Suresh" "Kavita"
    "Ashish" "Deepa" "Vikas" "Shweta" "Anil" "Meena" "Gopal" "Rina"
    "Ajay" "Nisha" "Manoj" "Sarita" "Arjun" "Kiran" "Dinesh" "Seema"
    "Gaurav" "Anita" "Vivek" "Preeti" "Alok" "Mamta"
)
INDIAN_LAST_NAMES=(
    "Kumar" "Singh" "Sharma" "Yadav" "Patel" "Gupta" "Reddy" "Mehta"
    "Shah" "Jain" "Khan" "Malik" "Verma" "Dubey" "Rao" "Nair"
    "Pillai" "Choudhary" "Thakur" "Saini" "Goyal" "Mishra" "Das" "Roy"
)

# --- Global arrays and associative array for referral logic and tracking ---
declare -a REGISTERED_USER_EMAILS=() # For ensuring unique emails
declare -a AVAILABLE_REFERRERS_QUEUE=() # Queue of referral codes that can still refer users (FIFO)
declare -A REFERRER_CHILD_COUNT=() # Associative array to track children referred by each code

# --- Helper Functions ---

# Generates a random Indian full name
generate_indian_name() {
    local first_name_index=$(( RANDOM % ${#INDIAN_FIRST_NAMES[@]} ))
    local last_name_index=$(( RANDOM % ${#INDIAN_LAST_NAMES[@]} ))
    echo "${INDIAN_FIRST_NAMES[$first_name_index]} ${INDIAN_LAST_NAMES[$last_name_index]}"
}

# Generates a random 10-digit Indian phone number
generate_indian_phone_number() {
    local prefix=$(shuf -n 1 -e 6 7 8 9) # Start with 6, 7, 8, or 9
    local suffix=$(head /dev/urandom | tr -dc 0-9 | head -c 9) # 9 random digits
    echo "${prefix}${suffix}"
}

# Generates a random 6-digit Indian pincode
generate_pincode() {
    local first_digit=$(shuf -n 1 -e 1 2 3 4 5 6 7 8) # Indian pincodes start with 1-8
    local suffix=$(head /dev/urandom | tr -dc 0-9 | head -c 5) # 5 random digits
    echo "${first_digit}${suffix}"
}

# Generates a unique email address for the current simulation run ending with @gmail.com
generate_unique_email() {
    local base_name_email_part=$(echo "$1" | tr -d ' ' | tr '[:upper:]' '[:lower:]' | head -c 10)
    local counter=0
    local new_email=""
    while true; do
        new_email="${base_name_email_part}${counter}@gmail.com" # Changed to @gmail.com
        local exists=false
        for existing_email in "${REGISTERED_USER_EMAILS[@]}"; do
            if [[ "$existing_email" == "$new_email" ]]; then
                exists=true
                break
            elif (( counter > 1000 )); then
                echo "Warning: Too many email generation attempts for $1, generating a random one." >&2
                new_email=$(head /dev/urandom | tr -dc a-z0-9 | head -c 15)@gmail.com
                exists=false
                break
            fi
        done
        if ! $exists; then
            echo "$new_email"
            break
        fi
        counter=$((counter + 1))
    done
}

# --- Main Simulation Logic ---
echo "--- Starting Registration & Upgrade Simulation ---"
echo "Registration Endpoint: ${REGISTER_ENDPOINT}"
echo "Upgrade Base Endpoint: ${UPGRADE_BASE_ENDPOINT}"
echo "Number of users to register: ${NUM_USERS_TO_REGISTER}"
echo "Delay between operations: ${DELAY_SECONDS} seconds"
echo "Membership Amount: ${MEMBERSHIP_AMOUNT}"
echo "Membership Package ID: ${MEMBERSHIP_PACKAGE_ID}"
echo "--------------------------------------------------"

for (( i=1; i<=NUM_USERS_TO_REGISTER; i++ )); do
    NAME=$(generate_indian_name)
    EMAIL=$(generate_unique_email "$NAME")
    PHONE=$(generate_indian_phone_number)
    PASSWORD="Password123!"
    PINCODE=$(generate_pincode)

    REFERRED_BY_CODE_TO_SEND="null" # Default for first user or if no referrers available

    # Binary Tree Referral Logic:
    # If there are available referrers, use the first one in the queue
    if (( ${#AVAILABLE_REFERRERS_QUEUE[@]} > 0 )); then
        REFERRED_BY_CODE_TO_SEND="${AVAILABLE_REFERRERS_QUEUE[0]}"
        # Increment child count for this referrer
        REFERRER_CHILD_COUNT["$REFERRED_BY_CODE_TO_SEND"]=$(( REFERRER_CHILD_COUNT["$REFERRED_BY_CODE_TO_SEND"] + 1 ))

        # If this referrer has now referred 2 children, remove them from the queue
        if (( REFERRER_CHILD_COUNT["$REFERRED_BY_CODE_TO_SEND"] >= 2 )); then
            # Remove the first element from the queue (pop)
            AVAILABLE_REFERRERS_QUEUE=("${AVAILABLE_REFERRERS_QUEUE[@]:1}")
            echo "  DEBUG: Referrer ${REFERRED_BY_CODE_TO_SEND} reached 2 children, removed from queue."
        fi
        echo "  DEBUG: Referring by: ${REFERRED_BY_CODE_TO_SEND} (Children: ${REFERRER_CHILD_COUNT["$REFERRED_BY_CODE_TO_SEND"]})"
    else
        echo "  DEBUG: No available referrers. Registering as top-level user."
    fi

    # Construct the JSON payload for Registration
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
                            }' 2>&1)

    JQ_REGISTER_EXIT_CODE=$?

    echo -e "\n--- User ${i}/${NUM_USERS_TO_REGISTER} (Registration) ---"
    echo -e "Attempting to register: ${NAME} (${EMAIL})"
    echo -e "Referral attempt: ${REFERRED_BY_CODE_TO_SEND:-'N/A (top-level)'}"

    if [ "$JQ_REGISTER_EXIT_CODE" -ne 0 ]; then
        echo -e "  ❌ Error: jq command failed to generate registration JSON payload."
        echo -e "     jq Exit Code: ${JQ_REGISTER_EXIT_CODE}"
        echo -e "     jq Error Output/Payload Content: ${JSON_PAYLOAD_REGISTER}"
        echo -e "     Skipping registration and upgrade for this user."
        sleep "$DELAY_SECONDS"
        continue
    fi

    if [ -z "$JSON_PAYLOAD_REGISTER" ]; then
        echo -e "  ❌ Error: Registration JSON_PAYLOAD is empty after jq command."
        echo -e "     Skipping registration and upgrade for this user."
        sleep "$DELAY_SECONDS"
        continue
    fi

    echo -e "Request Body (Registration):\n${JSON_PAYLOAD_REGISTER}"

    # Make the HTTP POST request for Registration
    HTTP_STATUS_REGISTER=$(curl -s -o /tmp/curl_response_register.txt -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD_REGISTER" \
        "$REGISTER_ENDPOINT")
    CURL_REGISTER_EXIT_CODE=$?
    RESPONSE_REGISTER=$(cat /tmp/curl_response_register.txt)

    USER_ID=""
    NEW_REFERRAL_CODE=""

    if [ "$CURL_REGISTER_EXIT_CODE" -ne 0 ]; then
        echo -e "  ❌ Critical Error: Curl command failed for registration."
        echo -e "     Curl Exit Code: ${CURL_REGISTER_EXIT_CODE}"
        echo -e "     Raw response (if any): ${RESPONSE_REGISTER}"
    elif [ "$HTTP_STATUS_REGISTER" -ge 200 ] && [ "$HTTP_STATUS_REGISTER" -lt 300 ]; then
        MESSAGE=$(echo "$RESPONSE_REGISTER" | jq -r '.message // "No message received"' 2>/dev/null)
        USER_ID=$(echo "$RESPONSE_REGISTER" | jq -r '.user._id // "N/A"' 2>/dev/null)
        NEW_REFERRAL_CODE=$(echo "$RESPONSE_REGISTER" | jq -r '.user.referralCode // "N/A"' 2>/dev/null)

        if [ "$USER_ID" != "N/A" ] && [ "$NEW_REFERRAL_CODE" != "N/A" ]; then
            REGISTERED_USER_EMAILS+=("$EMAIL") # Add email to tracking for uniqueness
            # Add new referral code to the queue of available referrers
            AVAILABLE_REFERRERS_QUEUE+=("$NEW_REFERRAL_CODE")
            REFERRER_CHILD_COUNT["$NEW_REFERRAL_CODE"]=0 # Initialize child count for new referrer
            echo -e "  ✅ Registration Success (HTTP ${HTTP_STATUS_REGISTER})!"
            echo -e "     User ID: ${USER_ID}, Referral Code: ${NEW_REFERRAL_CODE}"
            echo -e "     Message: ${MESSAGE}"
        else
            echo -e "  ⚠️ Registration Partial Success (HTTP ${HTTP_STATUS_REGISTER}) / Missing Data:"
            echo -e "     Message: ${MESSAGE}"
            echo -e "     Response: ${RESPONSE_REGISTER}"
        fi
    else
        ERROR_MESSAGE=$(echo "$RESPONSE_REGISTER" | jq -r '.message // "No specific message from API." 2>/dev/null')
        if [ "$ERROR_MESSAGE" == "No specific message from API." ] && [ -n "$RESPONSE_REGISTER" ]; then
            ERROR_MESSAGE="Raw API response (possible invalid JSON or unexpected format): ${RESPONSE_REGISTER}"
        fi
        echo -e "  ❌ Registration Failed (HTTP ${HTTP_STATUS_REGISTER})!"
        echo -e "     Error: ${ERROR_MESSAGE}"
        echo -e "     Full response: ${RESPONSE_REGISTER}"
    fi

    rm -f /tmp/curl_response_register.txt # Clean up temp file

    # --- Upgrade User ---
    if [ -n "$USER_ID" ] && [ "$USER_ID" != "N/A" ]; then
        echo -e "\n--- User ${i}/${NUM_USERS_TO_REGISTER} (Upgrade) ---"
        echo -e "Attempting to upgrade user ID: ${USER_ID}"

        UPGRADE_ENDPOINT="${UPGRADE_BASE_ENDPOINT}/${USER_ID}"

        # Construct JSON payload for upgrade
        JSON_PAYLOAD_UPGRADE=$(jq -n \
                                --arg amount "$MEMBERSHIP_AMOUNT" \
                                --arg packageId "$MEMBERSHIP_PACKAGE_ID" \
                                '{
                                  membershipAmount: ($amount | tonumber),
                                  membershipPackageId: $packageId
                                }' 2>&1)

        JQ_UPGRADE_EXIT_CODE=$?

        if [ "$JQ_UPGRADE_EXIT_CODE" -ne 0 ]; then
            echo -e "  ❌ Error: jq command failed to generate upgrade JSON payload."
            echo -e "     jq Exit Code: ${JQ_UPGRADE_EXIT_CODE}"
            echo -e "     jq Error Output/Payload Content: ${JSON_PAYLOAD_UPGRADE}"
            echo -e "     Skipping upgrade for this user."
            sleep "$DELAY_SECONDS"
            continue
        fi

        if [ -z "$JSON_PAYLOAD_UPGRADE" ]; then
            echo -e "  ❌ Error: Upgrade JSON_PAYLOAD is empty after jq command."
            echo -e "     Skipping upgrade for this user."
            sleep "$DELAY_SECONDS"
            continue
        fi

        echo -e "Request Body (Upgrade):\n${JSON_PAYLOAD_UPGRADE}"

        # Make the HTTP POST request for Upgrade
        HTTP_STATUS_UPGRADE=$(curl -s -o /tmp/curl_response_upgrade.txt -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$JSON_PAYLOAD_UPGRADE" \
            "$UPGRADE_ENDPOINT")
        CURL_UPGRADE_EXIT_CODE=$?
        RESPONSE_UPGRADE=$(cat /tmp/curl_response_upgrade.txt)

        if [ "$CURL_UPGRADE_EXIT_CODE" -ne 0 ]; then
            echo -e "  ❌ Critical Error: Curl command failed for upgrade."
            echo -e "     Curl Exit Code: ${CURL_UPGRADE_EXIT_CODE}"
            echo -e "     Raw response (if any): ${RESPONSE_UPGRADE}"
        elif [ "$HTTP_STATUS_UPGRADE" -ge 200 ] && [ "$HTTP_STATUS_UPGRADE" -lt 300 ]; then
            UPGRADE_MESSAGE=$(echo "$RESPONSE_UPGRADE" | jq -r '.message // "No message received" 2>/dev/null')
            echo -e "  ✅ Upgrade Success (HTTP ${HTTP_STATUS_UPGRADE})!"
            echo -e "     Message: ${UPGRADE_MESSAGE}"
        else
            UPGRADE_ERROR_MESSAGE=$(echo "$RESPONSE_UPGRADE" | jq -r '.message // "No specific message from API." 2>/dev/null')
            if [ "$UPGRADE_ERROR_MESSAGE" == "No specific message from API." ] && [ -n "$RESPONSE_UPGRADE" ]; then
                UPGRADE_ERROR_MESSAGE="Raw API response (possible invalid JSON or unexpected format): ${RESPONSE_UPGRADE}"
            fi
            echo -e "  ❌ Upgrade Failed (HTTP ${HTTP_STATUS_UPGRADE})!"
            echo -e "     Error: ${UPGRADE_ERROR_MESSAGE}"
            echo -e "     Full response: ${RESPONSE_UPGRADE}"
        fi
        rm -f /tmp/curl_response_upgrade.txt # Clean up temp file
    else
        echo -e "  ⚠️ Skipping upgrade for user ${i} as User ID was not obtained from registration."
    fi

    # Pause for the specified delay before the next operation
    sleep "$DELAY_SECONDS"
done

echo -e "\n----------------------------"
echo "--- Simulation Complete ---"
echo "Attempted to register and upgrade ${NUM_USERS_TO_REGISTER} users."
echo "Total unique referral codes collected and used for tree structure: ${#AVAILABLE_REFERRERS_QUEUE[@]}"
echo "Referrer Child Counts (code: count):"
for code in "${!REFERRER_CHILD_COUNT[@]}"; do
    echo "  $code: ${REFERRER_CHILD_COUNT[$code]}"
done
echo "----------------------------"
