import uvicorn
from app.config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    
    # Run the uvicorn server programmatically
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.agent_port,
        reload=True
    )
