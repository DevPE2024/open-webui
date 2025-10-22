"""
Router de autenticação integrado com Prodify
"""
from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional
import logging

from open_webui.utils.prodify_sync import authenticate_with_prodify
from open_webui.models.users import Users
import jwt
import os

log = logging.getLogger(__name__)

router = APIRouter()

class SigninForm(BaseModel):
    email: str
    password: str

class SigninResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    id: str
    email: str
    name: str
    role: str
    profile_image_url: str

@router.post("/signin", response_model=SigninResponse, name="auth:signin")
async def signin_with_prodify(request: Request, form: SigninForm):
    """
    Autenticação usando Prodify com sincronização automática
    """
    try:
        # Debug: Ver body bruto
        body_bytes = await request.body()
        log.info(f"🔍 Request body raw: {body_bytes}")
        
        log.info(f"🔐 Tentativa de login: {form.email}")
        log.info(f"  Password recebido no router - length: {len(form.password)}")
        log.info(f"  Password value: {form.password[:3]}..." if len(form.password) > 0 else "  Password VAZIO!")
        log.info(f"  Form completo: email={form.email}, password={'*' * len(form.password)}")
        
        # Primeiro, tentar autenticação via Prodify
        user = authenticate_with_prodify(form.email, form.password)
        
        if not user:
            # Se falhar, tentar autenticação local do OpenUIX
            log.info(f"⚠️ Tentando autenticação local para {form.email}")
            
            # Buscar usuário no OpenUIX
            local_user = Users.get_user_by_email(form.email)
            if local_user:
                # Verificar senha usando bcrypt
                import bcrypt
                
                try:
                    if bcrypt.checkpw(form.password.encode('utf-8'), local_user.password.encode('utf-8')):
                        user = local_user
                        log.info(f"✅ Autenticação local bem-sucedida para {form.email}")
                except Exception as e:
                    log.error(f"Erro na verificação local: {e}")
            
            if not user:
                log.warning(f"❌ Falha na autenticação para {form.email}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid email or password"
                )
        
        # Criar token JWT
        secret_key = os.getenv("WEBUI_SECRET_KEY", "secret-key-change-me")
        token = jwt.encode(
            {"id": user.id},
            secret_key,
            algorithm="HS256"
        )
        
        log.info(f"✅ Login bem-sucedido: {form.email}")
        
        return SigninResponse(
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
        log.error(f"❌ Erro no signin: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error"
        )

