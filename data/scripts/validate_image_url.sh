#!/bin/bash
#
# validate_image_url.sh
# Validates that a URL points to a valid PNG or JPEG image
#
# Usage: ./validate_image_url.sh "https://example.com/image.jpg"
#
# Returns:
#   VALID      - URL works and is PNG/JPEG
#   INVALID    - URL doesn't return 200 or is unreachable
#   WRONG_TYPE - URL works but content is not PNG/JPEG
#
# Exit codes:
#   0 - VALID
#   1 - INVALID
#   2 - WRONG_TYPE

URL="$1"

if [ -z "$URL" ]; then
    echo "Usage: $0 <url>"
    echo "Example: $0 \"https://example.com/image.jpg\""
    exit 1
fi

# Check if URL ends with valid extension
EXTENSION=$(echo "$URL" | grep -oiE '\.(png|jpg|jpeg)(\?.*)?$' | head -1)

# Perform HEAD request to check URL validity and content type
RESPONSE=$(curl -sI -L --max-time 10 "$URL" 2>/dev/null)

if [ -z "$RESPONSE" ]; then
    echo "INVALID"
    exit 1
fi

# Check HTTP status code (get the last one in case of redirects)
HTTP_STATUS=$(echo "$RESPONSE" | grep -i "^HTTP/" | tail -1 | awk '{print $2}')

if [ "$HTTP_STATUS" != "200" ]; then
    echo "INVALID"
    exit 1
fi

# Check content type
CONTENT_TYPE=$(echo "$RESPONSE" | grep -i "^content-type:" | tail -1 | tr -d '\r' | cut -d: -f2 | tr -d ' ' | cut -d';' -f1)

# Validate content type is image/png or image/jpeg
case "$CONTENT_TYPE" in
    image/png|image/jpeg|image/jpg)
        echo "VALID"
        exit 0
        ;;
    *)
        # If no valid content-type but URL has valid extension, try a GET request
        if [ -n "$EXTENSION" ]; then
            # Some servers don't return proper content-type on HEAD, try GET
            CONTENT_TYPE_GET=$(curl -sI -L --max-time 10 -X GET "$URL" 2>/dev/null | grep -i "^content-type:" | tail -1 | tr -d '\r' | cut -d: -f2 | tr -d ' ' | cut -d';' -f1)
            case "$CONTENT_TYPE_GET" in
                image/png|image/jpeg|image/jpg)
                    echo "VALID"
                    exit 0
                    ;;
            esac
        fi
        echo "WRONG_TYPE"
        exit 2
        ;;
esac
