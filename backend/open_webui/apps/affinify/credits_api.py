"""
API de Sincronização de Créditos Affinify - OpenUIX
Sincroniza créditos do usuário com o banco de dados do Prodify
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import logging
import psycopg2
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/affinify", tags=["affinify"])

# ============================================================================
# CONFIGURAÇÃO DO BANCO PRODIFY
# ============================================================================

PRODIFY_DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "prodify_db",
    "user": "postgres",
    "password": "postgres"
}

# ============================================================================
# MODELS
# ============================================================================

class CreditConsume(BaseModel):
    amount: int = 1

class CreditUpdate(BaseModel):
    credits: int
    isPaid: bool = False

class CreditResponse(BaseModel):
    credits: int
    isPaid: bool
    lastUpdate: str

# ============================================================================
# FUNÇÕES DE BANCO DE DADOS
# ============================================================================

def get_prodify_connection():
    """Conectar ao banco do Prodify"""
    try:
        conn = psycopg2.connect(**PRODIFY_DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Erro ao conectar ao Prodify DB: {e}")
        return None

def get_user_credits_from_prodify(user_email: str):
    """Buscar créditos do usuário no Prodify"""
    conn = get_prodify_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        
        # Buscar créditos do usuário
        cursor.execute("""
            SELECT 
                credits,
                is_paid,
                last_update
            FROM affinify_user_credits
            WHERE user_email = %s
        """, (user_email,))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if result:
            return {
                "credits": result[0],
                "isPaid": result[1],
                "lastUpdate": result[2].isoformat() if result[2] else None
            }
        
        # Se não existe, criar com 9 créditos free
        return {
            "credits": 9,
            "isPaid": False,
            "lastUpdate": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar créditos: {e}")
        return None

def update_user_credits_in_prodify(user_email: str, credits: int, is_paid: bool = False):
    """Atualizar créditos do usuário no Prodify"""
    conn = get_prodify_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Verificar se usuário já existe
        cursor.execute("""
            SELECT id FROM affinify_user_credits WHERE user_email = %s
        """, (user_email,))
        
        exists = cursor.fetchone()
        
        if exists:
            # Atualizar
            cursor.execute("""
                UPDATE affinify_user_credits
                SET credits = %s, is_paid = %s, last_update = NOW()
                WHERE user_email = %s
            """, (credits, is_paid, user_email))
        else:
            # Inserir
            cursor.execute("""
                INSERT INTO affinify_user_credits (user_email, credits, is_paid, last_update)
                VALUES (%s, %s, %s, NOW())
            """, (user_email, credits, is_paid))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"✅ Créditos atualizados para {user_email}: {credits} ({is_paid})")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao atualizar créditos: {e}")
        return False

def log_credit_transaction(user_email: str, amount: int, transaction_type: str, reason: str = ""):
    """Registrar transação de crédito no log"""
    conn = get_prodify_connection()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO affinify_credit_transactions 
            (user_email, amount, transaction_type, reason, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (user_email, amount, transaction_type, reason))
        
        conn.commit()
        cursor.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"Erro ao registrar transação: {e}")

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/credits")
async def get_credits(current_user = Depends(get_current_user)):
    """
    Buscar créditos do usuário autenticado
    Sincroniza com banco do Prodify
    """
    try:
        user_email = current_user.email
        
        # Buscar do Prodify
        credits_data = get_user_credits_from_prodify(user_email)
        
        if credits_data:
            logger.info(f"📊 Créditos de {user_email}: {credits_data['credits']}")
            return credits_data
        
        # Fallback
        return {
            "credits": 9,
            "isPaid": False,
            "lastUpdate": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar créditos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/credits/consume")
async def consume_credit(
    consume_data: CreditConsume,
    current_user = Depends(get_current_user)
):
    """
    Consumir créditos ao enviar mensagem
    Atualiza no banco do Prodify
    """
    try:
        user_email = current_user.email
        
        # Buscar créditos atuais
        credits_data = get_user_credits_from_prodify(user_email)
        
        if not credits_data:
            raise HTTPException(status_code=500, detail="Erro ao buscar créditos")
        
        current_credits = credits_data["credits"]
        
        # Verificar se tem créditos
        if current_credits <= 0:
            logger.warning(f"❌ {user_email} tentou enviar mensagem sem créditos")
            log_credit_transaction(user_email, 0, "BLOCKED", "Tentativa de envio sem créditos")
            raise HTTPException(
                status_code=403, 
                detail="Você não tem créditos suficientes. Compre mais créditos para continuar."
            )
        
        # Consumir crédito
        new_credits = current_credits - consume_data.amount
        success = update_user_credits_in_prodify(
            user_email, 
            new_credits, 
            credits_data["isPaid"]
        )
        
        if success:
            # Registrar transação
            log_credit_transaction(
                user_email, 
                -consume_data.amount, 
                "CONSUME", 
                "Mensagem enviada no OpenUIX"
            )
            
            logger.info(f"💳 Crédito consumido: {user_email} ({current_credits} -> {new_credits})")
            
            # Se zerou, notificar
            if new_credits == 0:
                logger.warning(f"⚠️ {user_email} ZEROU os créditos!")
                log_credit_transaction(
                    user_email, 
                    0, 
                    "DEPLETED", 
                    "Usuário esgotou todos os créditos"
                )
            
            return {
                "success": True,
                "credits": new_credits,
                "isPaid": credits_data["isPaid"],
                "message": "Crédito consumido com sucesso"
            }
        
        raise HTTPException(status_code=500, detail="Erro ao consumir crédito")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao consumir crédito: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/credits/update")
async def update_credits(
    update_data: CreditUpdate,
    current_user = Depends(get_current_user)
):
    """
    Atualizar créditos do usuário
    Chamado quando usuário compra créditos no Prodify
    """
    try:
        user_email = current_user.email
        
        success = update_user_credits_in_prodify(
            user_email,
            update_data.credits,
            update_data.isPaid
        )
        
        if success:
            # Registrar transação
            log_credit_transaction(
                user_email,
                update_data.credits,
                "PURCHASE" if update_data.isPaid else "GRANT",
                f"Créditos {'comprados' if update_data.isPaid else 'concedidos'}"
            )
            
            logger.info(f"✅ Créditos atualizados: {user_email} -> {update_data.credits}")
            
            return {
                "success": True,
                "credits": update_data.credits,
                "isPaid": update_data.isPaid,
                "message": "Créditos atualizados com sucesso"
            }
        
        raise HTTPException(status_code=500, detail="Erro ao atualizar créditos")
        
    except Exception as e:
        logger.error(f"Erro ao atualizar créditos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/credits/history")
async def get_credit_history(
    limit: int = 50,
    current_user = Depends(get_current_user)
):
    """
    Buscar histórico de transações de crédito
    """
    try:
        user_email = current_user.email
        conn = get_prodify_connection()
        
        if not conn:
            raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
        
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                amount,
                transaction_type,
                reason,
                created_at
            FROM affinify_credit_transactions
            WHERE user_email = %s
            ORDER BY created_at DESC
            LIMIT %s
        """, (user_email, limit))
        
        transactions = []
        for row in cursor.fetchall():
            transactions.append({
                "amount": row[0],
                "type": row[1],
                "reason": row[2],
                "date": row[3].isoformat() if row[3] else None
            })
        
        cursor.close()
        conn.close()
        
        return {"transactions": transactions}
        
    except Exception as e:
        logger.error(f"Erro ao buscar histórico: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# WEBHOOK PARA RECEBER ATUALIZAÇÕES DO PRODIFY
# ============================================================================

@router.post("/webhook/credits-updated")
async def webhook_credits_updated(user_email: str, credits: int, is_paid: bool = False):
    """
    Webhook chamado pelo Prodify quando usuário compra créditos
    """
    try:
        success = update_user_credits_in_prodify(user_email, credits, is_paid)
        
        if success:
            log_credit_transaction(
                user_email,
                credits,
                "WEBHOOK_UPDATE",
                f"Atualização via webhook do Prodify"
            )
            
            logger.info(f"🔔 Webhook: Créditos atualizados para {user_email}")
            
            return {
                "success": True,
                "message": "Créditos atualizados via webhook"
            }
        
        raise HTTPException(status_code=500, detail="Erro ao processar webhook")
        
    except Exception as e:
        logger.error(f"Erro no webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# FUNÇÃO PARA REGISTRAR ROTAS
# ============================================================================

def get_current_user():
    """Placeholder - deve ser importado do sistema de auth do OpenUIX"""
    # TODO: Importar do open_webui.apps.webui.routers.auths
    pass

def register_routes(app):
    """Registrar rotas no app FastAPI"""
    app.include_router(router)
    logger.info("✅ Affinify: Rotas de créditos registradas")

