#!/bin/bash

# --- Configuration ---
REGISTER_ENDPOINT="http://localhost:3000/api/auth/register"
NUM_USERS_TO_REGISTER=30
DELAY_SECONDS=2 # Delay between registrations in seconds (e.g., 0.5 for 500ms)

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

# --- Global arrays to store generated referral codes and emails ---
# These are used to select parent referral codes and ensure unique emails during the simulation.
declare -a REGISTERED_REFERRAL_CODES=()
declare -a REGISTERED_USER_EMAILS=()

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

# Generates a unique email address for the current simulation run
generate_unique_email() {
    # Create a base for the email using parts of the name
    local base_name_email_part=$(echo "$1" | tr -d ' ' | tr '[:upper:]' '[:lower:]' | head -c 10)
    local counter=0
    local new_email=""
    while true; do
        new_email="${base_name_email_part}${counter}@example.com"
        local exists=false
        # Check if this email already exists in our list of registered emails
        for existing_email in "${REGISTERED_USER_EMAILS[@]}"; do
            if [[ "$existing_email" == "$new_email" ]]; then
                exists=true
                break
            # Add a safety break for very long loops in case name-based emails collide a lot
            elif (( counter > 1000 )); then
                echo "Warning: Too many email generation attempts for $1, generating a random one." >&2
                new_email=$(head /dev/urandom | tr -dc a-z0-9 | head -c 15)@example.com
                exists=false # Assume random is unique enough
                break
            fi
        done
        if ! $exists; then
            echo "$new_email"
            break
        fi
        counter=$((counter + 1)) # Increment counter if email is not unique
    done
}

# --- Main Simulation Logic ---
echo "--- Starting Registration Simulation ---"
echo "Targeting endpoint: ${REGISTER_ENDPOINT}"
echo "Number of users to register: ${NUM_USERS_TO_REGISTER}"
echo "Delay between registrations: ${DELAY_SECONDS} seconds"
echo "----------------------------------------"

for (( i=1; i<=NUM_USERS_TO_REGISTER; i++ )); do
    NAME=$(generate_indian_name)
    EMAIL=$(generate_unique_email "$NAME") # Generate a unique email
    PHONE=$(generate_indian_phone_number)
    PASSWORD="Password123!" # Using a fixed password for simulation purposes
    PINCODE=$(generate_pincode)

    REFERRED_BY_CODE_TO_SEND="null" # Default value for the 'referredByCode' field in JSON
    # If there are existing referral codes, randomly pick one for this user
    if (( ${#REGISTERED_REFERRAL_CODES[@]} > 0 )); then
        # 70% chance to be referred by an existing user
        if (( RANDOM % 10 < 7 )); then
            REFERRED_BY_CODE_TO_SEND="${REGISTERED_REFERRAL_CODES[$(( RANDOM % ${#REGISTERED_REFERRAL_CODES[@]} ))]}"
        fi
    fi

    # Construct the JSON payload using jq
    # IMPORTANT: Ensure NO hidden characters (like non-breaking spaces) exist in this block.
    # Manually re-type the indentation if you keep getting errors.
    JSON_PAYLOAD=$(jq -n \
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
                    }' 2>&1) # Redirect jq's stderr to stdout for debugging

    JQ_EXIT_CODE=$? # Capture jq's exit code immediately

    echo -e "\n--- User ${i}/${NUM_USERS_TO_REGISTER} ---"
    echo -e "Attempting to register: ${NAME} (${EMAIL})"
    echo -e "Referral attempt: ${REFERRED_BY_CODE_TO_SEND:-'N/A (top-level)'}"

    if [ "$JQ_EXIT_CODE" -ne 0 ]; then
        echo -e "  ❌ Error: jq command failed to generate JSON payload."
        echo -e "     jq Exit Code: ${JQ_EXIT_CODE}"
        echo -e "     jq Error Output/Payload Content: ${JSON_PAYLOAD}" # This will contain jq's error message
        echo -e "     Skipping registration for this user."
        sleep "$DELAY_SECONDS" # Still pause to prevent tight loops on errors
        continue # Skip to the next user
    fi

    if [ -z "$JSON_PAYLOAD" ]; then
        echo -e "  ❌ Error: JSON_PAYLOAD is empty after jq command."
        echo -e "     This usually means jq produced no output despite exiting successfully (possible issue with input vars)."
        echo -e "     Skipping registration for this user."
        sleep "$DELAY_SECONDS"
        continue
    fi

    echo -e "Request Body:\n${JSON_PAYLOAD}" # Log the full request body now that we've verified it

    # Make the HTTP POST request using curl, storing response and status code
    HTTP_STATUS=$(curl -s -o /tmp/curl_response.txt -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD" \
        "$REGISTER_ENDPOINT")
    CURL_EXIT_CODE=$? # Capture curl's exit code

    RESPONSE=$(cat /tmp/curl_response.txt)

    if [ "$CURL_EXIT_CODE" -ne 0 ]; then
        echo -e "  ❌ Critical Error: Curl command failed to execute."
        echo -e "     Curl Exit Code: ${CURL_EXIT_CODE}"
        echo -e "     This might indicate a network issue, DNS problem, or server not reachable."
        echo -e "     Raw response (if any): ${RESPONSE}"
    elif [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
        # Successful response (2xx status code)
        # MOVED 2>/dev/null OUTSIDE THE QUOTES for shell redirection
        MESSAGE=$(echo "$RESPONSE" | jq -r '.message // "No message received"' 2>/dev/null)
        USER_ID=$(echo "$RESPONSE" | jq -r '.user._id // "N/A"' 2>/dev/null)
        NEW_REFERRAL_CODE=$(echo "$RESPONSE" | jq -r '.user.referralCode // "N/A"' 2>/dev/null)

        if [ "$NEW_REFERRAL_CODE" != "N/A" ]; then
            REGISTERED_REFERRAL_CODES+=("$NEW_REFERRAL_CODE")
            REGISTERED_USER_EMAILS+=("$EMAIL")
            echo -e "  ✅ Success (HTTP ${HTTP_STATUS})!"
            echo -e "     User ID: ${USER_ID}, Referral Code: ${NEW_REFERRAL_CODE}"
            echo -e "     Message: ${MESSAGE}"
        else
            echo -e "  ⚠️ Partial Success (HTTP ${HTTP_STATUS}) / Missing Data:"
            echo -e "     Message: ${MESSAGE}"
            echo -e "     Response: ${RESPONSE}"
        fi
    else
        # Error response (non-2xx status code)
        # Attempt to parse specific message or show full response
        # MOVED 2>/dev/null OUTSIDE THE QUOTES for shell redirection
        ERROR_MESSAGE=$(echo "$RESPONSE" | jq -r '.message // "No specific message from API."' 2>/dev/null)
        if [ "$ERROR_MESSAGE" == "No specific message from API." ] && [ -n "$RESPONSE" ]; then
             # If jq couldn't find a 'message' field but response is not empty, show raw response
            ERROR_MESSAGE="Raw API response (possible invalid JSON or unexpected format): ${RESPONSE}"
        fi

        echo -e "  ❌ Failed (HTTP ${HTTP_STATUS})!"
        echo -e "     Error: ${ERROR_MESSAGE}"
        echo -e "     Request failed for: ${NAME} (${EMAIL})"
        echo -e "     Full response: ${RESPONSE}"
    fi

    # Clean up the temporary response file
    rm -f /tmp/curl_response.txt

    # Pause for the specified delay before the next registration
    sleep "$DELAY_SECONDS"
done

echo -e "\n----------------------------"
echo "--- Simulation Complete ---"
echo "Attempted to register ${NUM_USERS_TO_REGISTER} users."
echo "Total unique referral codes collected: ${#REGISTERED_REFERRAL_CODES[@]}"
echo "Collected referral codes: ${REGISTERED_REFERRAL_CODES[@]}"
echo "----------------------------"
