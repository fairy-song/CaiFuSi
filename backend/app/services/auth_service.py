import json
import base64

try:
    from firebase_admin import auth, firestore
    FIREBASE_AVAILABLE = True
except Exception as e:
    print(f"Warning: firebase_admin could not be imported in auth_service (Python 3.14 metaclass issue): {e}")
    auth = None
    class MockFirestore:
        SERVER_TIMESTAMP = "SERVER_TIMESTAMP"
    firestore = MockFirestore()
    FIREBASE_AVAILABLE = False

from .firestore_service import create_user_profile, get_user_profile, update_user_profile

def verify_firebase_token(id_token):
    """Verifies Firebase ID token and returns user info."""
    try:
        if FIREBASE_AVAILABLE and auth:
            decoded_token = auth.verify_id_token(id_token)
        else:
            # Fallback: manually parse JWT payload for local development/Python 3.14 mock
            try:
                payload_b64 = id_token.split('.')[1]
                payload_b64 += '=' * (-len(payload_b64) % 4)
                decoded_token = json.loads(base64.urlsafe_b64decode(payload_b64).decode('utf-8'))
            except Exception:
                decoded_token = {"user_id": "mock_user", "email": "mock@user.com"}
            
            # Use 'user_id' instead of 'uid' for manually decoded Firebase JWTs
            if 'uid' not in decoded_token and 'user_id' in decoded_token:
                decoded_token['uid'] = decoded_token['user_id']
                
        uid = decoded_token.get('uid', 'default_mock_uid')
        email = decoded_token.get('email', f'{uid}@mock.local')

        
        # Check if user profile exists in Firestore, create if not
        profile, error = get_user_profile(uid)
        if error and "User not found" in error: # Be careful with string matching for errors
            profile_id, create_error = create_user_profile(uid, email)
            if create_error:
                return None, f"Failed to create user profile: {create_error}"
            profile, _ = get_user_profile(uid) # Fetch again
        elif error:
            return None, f"Error fetching user profile: {error}"
        else:
            # Update last login time - 使用正确的 firestore.SERVER_TIMESTAMP
            _, update_error = update_user_profile(uid, {"lastLogin": firestore.SERVER_TIMESTAMP})
            if update_error:
                print(f"Warning: Failed to update last login for user {uid}: {update_error}")


        return {"uid": uid, "email": email, "profile": profile}, None
    except auth.InvalidIdTokenError:
        return None, "Invalid ID token"
    except Exception as e:
        return None, str(e)

# If you were to implement custom registration (not recommended with Firebase Auth for client):
# def register_user_custom(email, password):
#     try:
#         # This is for creating users directly via Admin SDK, typically client SDK handles this
#         user = auth.create_user(email=email, password=password)
#         # Create profile in Firestore
#         profile_id, error = create_user_profile(user.uid, email)
#         if error:
#             # Potentially delete the Firebase Auth user if profile creation fails, or handle inconsistency
#             auth.delete_user(user.uid)
#             return None, f"Failed to create user profile: {error}"
#         return {"uid": user.uid, "email": user.email}, None
#     except Exception as e:
#         return None, str(e) 