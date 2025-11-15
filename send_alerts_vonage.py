import mysql.connector
import vonage
from datetime import datetime, timedelta

# =================== DATABASE CONFIGURATION ===================
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'akriti0104',
    'database': 'food_expiry_db'
}

# =================== VONAGE (NEXMO) CONFIGURATION ===================
# Replace with your actual Vonage credentials and number
VONAGE_API_KEY = "YOUR_VONAGE_API_KEY"      # Get from your Vonage Dashboard
VONAGE_API_SECRET = "YOUR_VONAGE_API_SECRET" # Get from your Vonage Dashboard
VONAGE_SMS_NUMBER = "12015550123"          # Your Vonage virtual number

def send_sms_alert(to_number, message):
    try:
        # Initialize the Vonage client
        client = vonage.Client(key=VONAGE_API_KEY, secret=VONAGE_API_SECRET)
        sms = vonage.Sms(client)

        # Send the SMS
        responseData = sms.send_message({
            "from": VONAGE_SMS_NUMBER,
            "to": to_number,
            "text": message,
        })

        if responseData["messages"][0]["status"] == "0":
            print(f"✅ Vonage SMS sent successfully to {to_number}")
        else:
            # Print the error if sending failed
            print(f"❌ Vonage SMS failed to send to {to_number}. Error: {responseData['messages'][0]['error-text']}")

    except Exception as e:
        print(f"❌ Failed to send SMS via Vonage to {to_number}: {e}")

def check_and_alert():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        # Set the alert threshold to 2 days from now
        alert_date = datetime.now() + timedelta(days=2)
        alert_date_str = alert_date.strftime('%Y-%m-%d')
        
        # SQL query to find items expiring exactly on the alert date
        query = f"""
            SELECT fi.item_name, fi.expiry_date, u.name, u.phone
            FROM food_items AS fi
            JOIN users AS u ON fi.user_id = u.id  -- ✅ FIXED: Changed u.user_id to u.id
            WHERE fi.expiry_date = '{alert_date_str}'
        """
        
        cursor.execute(query)
        expiring_items = cursor.fetchall()
        
        print(f"🔍 Found {len(expiring_items)} items expiring on {alert_date_str}")

        if expiring_items:
            for item in expiring_items:
                # Ensure phone number is in correct format
                phone_number = item['phone']
                if not phone_number.startswith('+'):
                    # Add country code if missing (assuming India +91)
                    phone_number = '+91' + phone_number
                
                alert_message = (
                    f"⚠ Food Expiry Alert: Your item '{item['item_name']}' is about "
                    f"to expire on {item['expiry_date'].strftime('%B %d, %Y')}."
                )
                print(f"📱 Preparing to send Vonage alert to {phone_number}: {alert_message}")
                send_sms_alert(phone_number, alert_message)
        else:
            print("✅ No items found expiring soon.")

    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ General error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":  # ✅ FIXED: Changed _main_ to __main__
    print("🚀 Starting Vonage SMS alert script...")
    check_and_alert()
    print("✅ Vonage SMS alert script completed.")