import logging
import asyncpg
from typing import List, Optional
from langchain_core.messages import HumanMessage, AIMessage
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_pool = None


async def init_db_pool():
    """Initialize PostgreSQL connection pool and verify/create table."""
    global _pool
    if _pool is None:
        try:
            # Parse the jdbc connection URL or use standard database DSN
            dsn = settings.database_url
            # If the dsn starts with jdbc:postgresql://, convert it to standard postgresql://
            if dsn.startswith("jdbc:postgresql://"):
                dsn = dsn.replace("jdbc:postgresql://", "postgresql://")
            
            _pool = await asyncpg.create_pool(
                dsn=dsn,
                min_size=2,
                max_size=10
            )
            logger.info("PostgreSQL database connection pool initialized successfully.")
            
            # Auto-create independent chat messages table schema
            async with _pool.acquire() as conn:
                # We need gen_random_uuid() extension support, but we can also use standard table structure
                await conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS chat_messages (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        customer_id UUID NOT NULL,
                        sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'assistant')),
                        content TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE INDEX IF NOT EXISTS idx_chat_messages_customer_id_created_at 
                    ON chat_messages(customer_id, created_at);
                    """
                )
                logger.info("Verified chat_messages table schema exists.")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL pool: {e}", exc_info=True)
            raise e


async def close_db_pool():
    """Close PostgreSQL connection pool."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("PostgreSQL database connection pool closed.")


async def get_chat_history(customer_id: str, limit: int = 10) -> List:
    """Retrieve the last N messages for a customer within 12 hours, mapped to LangChain message classes."""
    global _pool
    if _pool is None:
        logger.warning("Database pool is not initialized. Returning empty history.")
        return []

    try:
        async with _pool.acquire() as conn:
            # Query last limit messages ordered by created_at DESC, within last 12 hours
            rows = await conn.fetch(
                """
                SELECT sender, content 
                FROM chat_messages 
                WHERE customer_id = $1::uuid 
                  AND created_at >= NOW() - INTERVAL '12 hours'
                ORDER BY created_at DESC 
                LIMIT $2
                """,
                customer_id,
                limit
            )
            
            messages = []
            for row in reversed(rows):
                sender = row['sender']
                content = row['content']
                if sender == 'user':
                    messages.append(HumanMessage(content=content))
                elif sender == 'assistant':
                    messages.append(AIMessage(content=content))
            return messages
    except Exception as e:
        logger.error(f"Error fetching chat history for customer {customer_id}: {e}", exc_info=True)
        return []


async def save_chat_message(customer_id: str, sender: str, content: str):
    """Save a single message to the chat history."""
    global _pool
    if _pool is None:
        logger.warning("Database pool is not initialized. Cannot save chat message.")
        return

    try:
        async with _pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO chat_messages (customer_id, sender, content)
                VALUES ($1::uuid, $2, $3)
                """,
                customer_id,
                sender,
                content
            )
    except Exception as e:
        logger.error(f"Error saving chat message for customer {customer_id}: {e}", exc_info=True)


async def get_last_active_customer_id(customer_ids: List[str]) -> Optional[str]:
    """Find the customer ID that has the most recent chat message in the database."""
    global _pool
    if _pool is None or not customer_ids:
        return None
    try:
        import uuid
        uuid_list = [uuid.UUID(cid) for cid in customer_ids]
        async with _pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT customer_id 
                FROM chat_messages 
                WHERE customer_id = ANY($1::uuid[]) 
                ORDER BY created_at DESC 
                LIMIT 1
                """,
                uuid_list
            )
            if row:
                return str(row['customer_id'])
    except Exception as e:
        logger.error(f"Error finding last active customer: {e}")
    return None

