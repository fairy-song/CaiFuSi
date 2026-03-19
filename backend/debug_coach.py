import os, sys, traceback

sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
os.environ['DEV_MODE'] = 'true'

print("=== Step 1: Test zhipuai_service import ===")
try:
    from app.services.zhipuai_service import ZhipuAIService
    svc = ZhipuAIService()
    print("OK - ZhipuAIService created, client:", svc.client)
except Exception as e:
    print("FAIL:", e)
    traceback.print_exc()

print()
print("=== Step 2: Test coach_routes import ===")
try:
    from app.routes.coach_routes import coach_bp
    print("OK - coach_bp:", coach_bp)
except Exception as e:
    print("FAIL:", e)
    traceback.print_exc()

print()
print("=== Step 3: Test create_app and route listing ===")
try:
    from app import create_app
    application = create_app()
    print("OK - app created")
    print("Registered routes:")
    for rule in application.url_map.iter_rules():
        print(f"  {rule.rule} -> {rule.methods}")
except Exception as e:
    print("FAIL:", e)
    traceback.print_exc()
