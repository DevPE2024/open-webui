"""
SSO (Single Sign-On) Authentication Router
Permite autenticação automática via Prodify

Author: Affinify Team
Date: 20 de Outubro de 2025
"""

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel
from open_webui.models.users import Users
from open_webui.models.auths import Auths
from open_webui.utils.auth import create_token
import logging
import time
import json
import base64
import datetime

log = logging.getLogger(__name__)

router = APIRouter()

class SSORequest(BaseModel):
    email: str
    sso_token: str
    provider: str = "prodify"

class SSOResponse(BaseModel):
    token: str
    id: str
    email: str
    name: str
    role: str
    profile_image_url: str

@router.post("/sso", response_model=SSOResponse)
async def sso_login(request: Request, response: Response, sso_data: SSORequest):
    """
    Autenticação via SSO do Prodify
    
    Fluxo:
    1. Recebe email + sso_token do Prodify
    2. Valida o token (decodifica e verifica timestamp)
    3. Se válido, cria sessão automaticamente
    4. Retorna token JWT do OpenUIX
    """
    try:
        log.info(f"🔐 SSO Request de: {sso_data.email}")
        log.info(f"   Provider: {sso_data.provider}")
        
        # Validar provider
        if sso_data.provider != "prodify":
            log.warning(f"❌ Provider inválido: {sso_data.provider}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid SSO provider"
            )
        
        # Decodificar e validar token SSO
        try:
            # Decodificar base64
            decoded_bytes = base64.b64decode(sso_data.sso_token)
            decoded_str = decoded_bytes.decode('utf-8')
            token_data = json.loads(decoded_str)
            
            log.info(f"🔓 Token decodificado: {token_data}")
            
            # Verificar campos obrigatórios
            if 'email' not in token_data or 'timestamp' not in token_data or 'source' not in token_data:
                raise ValueError("Token SSO inválido: faltam campos obrigatórios")
            
            # Verificar se o email do token corresponde ao email da requisição
            if token_data['email'] != sso_data.email:
                log.warning(f"❌ Email do token ({token_data['email']}) não corresponde ao email da request ({sso_data.email})")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Token email mismatch"
                )
            
            # Verificar se o token não expirou (10 minutos)
            token_age = time.time() * 1000 - token_data['timestamp']
            max_age = 10 * 60 * 1000  # 10 minutos em milissegundos
            
            if token_age > max_age:
                log.warning(f"❌ Token SSO expirado! Idade: {token_age / 1000} segundos")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="SSO token expired"
                )
            
            # Verificar source
            if token_data['source'] != 'prodify':
                raise ValueError("Token SSO não é do Prodify")
            
            log.info(f"✅ Token SSO válido! Idade: {token_age / 1000:.1f} segundos")
            
        except (base64.binascii.Error, json.JSONDecodeError, ValueError) as e:
            log.error(f"❌ Erro ao decodificar token SSO: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid SSO token format"
            )
        
        # Buscar usuário no OpenUIX
        user = Users.get_user_by_email(sso_data.email.lower())
        
        if not user:
            log.warning(f"❌ Usuário não encontrado no OpenUIX: {sso_data.email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please sync users from Prodify first."
            )
        
        log.info(f"✅ Usuário encontrado: {user.name} ({user.email})")
        
        # Criar token JWT do OpenUIX
        token = create_token(
            data={"id": user.id}
        )
        
        # Definir cookie
        datetime_expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
        
        response.set_cookie(
            key="token",
            value=token,
            expires=datetime_expires_at,
            httponly=True,
            samesite="lax",
            secure=False  # False para desenvolvimento local
        )
        
        log.info(f"✅ SSO Login bem-sucedido para: {user.email}")
        
        return SSOResponse(
            token=token,
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            profile_image_url=user.profile_image_url
        )
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Erro no SSO login: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SSO authentication error"
        )

