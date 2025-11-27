
import firebase_admin
from firebase_admin import credentials, firestore
import time
import random
import atexit
import sys

# --- Configuration ---
# IMPORTANT:
# 1. Download your serviceAccountKey.json from your Firebase project:
#    Project Settings > Service accounts > Generate new private key.
# 2. Place the downloaded file in the same directory as this script.
CRED_PATH = 'serviceAccountKey.json'

# The ID of the device in your Firestore 'devices' collection to simulate.
# You will be prompted to enter this when you run the script.
DEVICE_ID = ''

# --- Firebase Initialization ---
try:
    print("Initializing Firebase...")
    cred = credentials.Certificate(CRED_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Please ensure your serviceAccountKey.json is correct and in the same directory.")
    sys.exit(1)

# Reference to the specific device document in Firestore
device_ref = None

def update_device_status(is_active, last_pos=None):
    """Updates the device status to online or offline."""
    if not device_ref:
        return
    try:
        update_data = {'isActive': is_active, 'updatedAt': firestore.SERVER_TIMESTAMP}
        if last_pos:
            update_data['lastPosition'] = last_pos
        device_ref.update(update_data)
        status_text = "Online" if is_active else "Offline"
        print(f"Device {DEVICE_ID} is now {status_text}.")
    except Exception as e:
        print(f"Error updating device status: {e}")

@atexit.register
def shutdown_device():
    """This function is called when the script is terminated."""
    print("\nShutting down... Setting device to offline.")
    # Fetch the last position before shutting down
    last_pos = None
    if device_ref:
        try:
            doc = device_ref.get()
            if doc.exists:
                last_pos = doc.to_dict().get('lastPosition')
        except Exception as e:
            print(f"Could not fetch last position on shutdown: {e}")
    update_device_status(False, last_pos)
    print("Shutdown complete.")

def simulate_gps_movement():
    """Simulates the device moving along a path and sending updates."""
    global device_ref
    
    # A path along Market Street, San Francisco (from Ferry Building to near Van Ness)
    market_street_path = [
        (37.7950, -122.3940),  # Near Ferry Building
        (37.7935, -122.3965),
        (37.7920, -122.3990),
        (37.7905, -122.4015),
        (37.7885, -122.4045),  # Near Montgomery St
        (37.7865, -122.4075),  # Near Powell St
        (37.7845, -122.4105),
        (37.7825, -122.4135),
        (37.7805, -122.4165),
        (37.7780, -122.4195)   # Near Van Ness Ave
    ]

    # Check if the device exists
    device_ref = db.collection('devices').document(DEVICE_ID)
    try:
        doc = device_ref.get()
        if not doc.exists:
            print(f"Error: Device with ID '{DEVICE_ID}' not found in Firestore.")
            print("Please add the device in the web app before running the simulator.")
            sys.exit(1)
        print(f"Successfully found device '{DEVICE_ID}'. Starting simulation...")
    except Exception as e:
        print(f"Error accessing Firestore: {e}")
        sys.exit(1)

    # Set initial status to Online
    update_device_status(True)

    print("\n--- GPS Simulation Started ---")
    print("Press Ctrl+C to stop the simulation.")

    # Loop through the path indefinitely
    while True:
        for i, (lat, lng) in enumerate(market_street_path):
            try:
                # Simulate some device metrics
                battery_level = random.randint(15, 100) # Battery between 15% and 100%
                speed_mph = random.randint(5, 25)
                
                # Add a tiny random offset to the coordinates for more realism
                lat += random.uniform(-0.0001, 0.0001)
                lng += random.uniform(-0.0001, 0.0001)

                position_data = {
                    'lat': lat,
                    'lng': lng,
                    'speed': f'{speed_mph} mph',
                    'battery': battery_level,
                    'timestamp': firestore.SERVER_TIMESTAMP
                }

                # Update the device document in Firestore
                device_ref.update({
                    'lastPosition': position_data,
                    'isActive': True,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                })

                print(f"[{time.ctime()}] Sent update: Pos {i+1}/{len(market_street_path)} | Lat: {lat:.4f}, Lng: {lng:.4f} | Bat: {battery_level}%")
                
                # Wait before sending the next update
                time.sleep(5) # 5-second interval

            except KeyboardInterrupt:
                # This allows Ctrl+C to trigger the atexit handler
                sys.exit(0)
            except Exception as e:
                print(f"An error occurred during simulation: {e}")
                time.sleep(10) # Wait longer if an error occurs

if __name__ == "__main__":
    DEVICE_ID = input("Enter the Device ID to simulate: ")
    if not DEVICE_ID:
        print("Device ID cannot be empty.")
    else:
        simulate_gps_movement()
