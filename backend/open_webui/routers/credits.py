from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional
import logging

from open_webui.utils.credits import check_user_credits, consume_user_credits
from open_webui.models.users import Users

log = logging.getLogger(__name__)
router = APIRouter()

# Função para obter usuário autenticado (substituindo get_verified_user)
async def get_current_user(request: Request):
    """Obtém usuário atual do request"""
    try:
        # Tentar obter do estado do request (FastAPI OAuth2PasswordBearer)
        if hasattr(request.state, "user"):
            return request.state.user
        
        # Fallback: buscar do token no header
        from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
        security = HTTPBearer()
        credentials: HTTPAuthorizationCredentials = await security(request)
        
        if credentials:
            import jwt
            import os
            secret = os.getenv("WEBUI_SECRET_KEY", "secret-key")
            payload = jwt.decode(credentials.credentials, secret, algorithms=["HS256"])
            user = Users.get_user_by_id(payload.get("id"))
            return user
    except Exception as e:
        log.warning(f"Erro ao obter usuário: {e}")
        raise HTTPException(status_code=401, detail="Not authenticated")

class CreditsResponse(BaseModel):
    success: bool
    credits: int
    hasCredits: bool
    planName: Optional[str] = None
    error: Optional[str] = None

class ConsumeCreditsRequest(BaseModel):
    credits: int = 1

class ConsumeCreditsResponse(BaseModel):
    success: bool
    credits: Optional[int] = None
    consumed: Optional[int] = None
    message: Optional[str] = None
    error: Optional[str] = None

@router.get("/", response_model=CreditsResponse)
async def get_credits(user=Depends(get_current_user)):
    """
    Verifica o saldo de créditos do usuário
    """
    try:
        result = check_user_credits(user.email)
        return CreditsResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/consume", response_model=ConsumeCreditsResponse)
async def consume_credits(
    request: ConsumeCreditsRequest,
    user=Depends(get_current_user)
):
    """
    Consome créditos do usuário
    """
    try:
        result = consume_user_credits(user.email, request.credits)
        
        if not result.get('success'):
            if result.get('error') == 'Créditos insuficientes':
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        'error': 'Créditos insuficientes',
                        'credits': result.get('credits', 0),
                        'required': result.get('required', request.credits)
                    }
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=result.get('error', 'Erro ao consumir créditos')
                )
        
        return ConsumeCreditsResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

