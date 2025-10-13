import logging
import uuid
from typing import Optional

from open_webui.internal.db import Base, get_db
from open_webui.models.users import UserModel, Users
from open_webui.env import SRC_LOG_LEVELS
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, String, Text
from open_webui.utils.auth import verify_password, get_password_hash

# Importar autenticação do Prodify
try:
    from open_webui.utils.prodify_auth import ProdifyAuth
    PRODIFY_AUTH_ENABLED = True
except ImportError:
    PRODIFY_AUTH_ENABLED = False
    ProdifyAuth = None

log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["MODELS"])

####################
# DB MODEL
####################


class Auth(Base):
    __tablename__ = "auth"

    id = Column(String, primary_key=True)
    email = Column(String)
    password = Column(Text)
    active = Column(Boolean)


class AuthModel(BaseModel):
    id: str
    email: str
    password: str
    active: bool = True


####################
# Forms
####################


class Token(BaseModel):
    token: str
    token_type: str


class ApiKey(BaseModel):
    api_key: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    profile_image_url: str


class SigninResponse(Token, UserResponse):
    pass


class SigninForm(BaseModel):
    email: str
    password: str


class LdapForm(BaseModel):
    user: str
    password: str


class ProfileImageUrlForm(BaseModel):
    profile_image_url: str


class UpdatePasswordForm(BaseModel):
    password: str
    new_password: str


class SignupForm(BaseModel):
    name: str
    email: str
    password: str
    profile_image_url: Optional[str] = "/user.png"


class AddUserForm(SignupForm):
    role: Optional[str] = "pending"


class AuthsTable:
    def insert_new_auth(
        self,
        email: str,
        password: str,
        name: str,
        profile_image_url: str = "/user.png",
        role: str = "pending",
        oauth_sub: Optional[str] = None,
    ) -> Optional[UserModel]:
        with get_db() as db:
            log.info("insert_new_auth")

            id = str(uuid.uuid4())

            auth = AuthModel(
                **{"id": id, "email": email, "password": password, "active": True}
            )
            result = Auth(**auth.model_dump())
            db.add(result)

            user = Users.insert_new_user(
                id, name, email, profile_image_url, role, oauth_sub
            )

            db.commit()
            db.refresh(result)

            if result and user:
                return user
            else:
                return None

    def authenticate_user(self, email: str, password: str) -> Optional[UserModel]:
        log.info(f"authenticate_user: {email}")

        # 🔗 INTEGRAÇÃO PRODIFY: Tentar autenticar primeiro no Prodify
        if PRODIFY_AUTH_ENABLED and ProdifyAuth:
            try:
                prodify_user = ProdifyAuth.authenticate_prodify_user(email, password)
                
                if prodify_user:
                    log.info(f"✅ Usuário autenticado no Prodify: {email}")
                    
                    # Verificar se usuário já existe no OpenUIX
                    existing_user = Users.get_user_by_email(prodify_user["email"])
                    
                    if existing_user:
                        # Atualizar dados do usuário local com dados do Prodify
                        log.info(f"Sincronizando usuário existente: {email}")
                        return existing_user
                    else:
                        # Criar novo usuário no OpenUIX baseado no Prodify
                        log.info(f"Criando novo usuário do Prodify no OpenUIX: {email}")
                        
                        full_name = prodify_user.get("name", "")
                        if prodify_user.get("surname"):
                            full_name = f"{full_name} {prodify_user['surname']}".strip()
                        
                        profile_image = prodify_user.get("image") or "/user.png"
                        
                        # Criar usuário no OpenUIX (primeiro usuário do Prodify vira admin)
                        has_users = Users.has_users()
                        role = "admin" if not has_users else "user"
                        
                        new_user = self.insert_new_auth(
                            email=prodify_user["email"],
                            password=get_password_hash(password),
                            name=full_name or prodify_user.get("username", "User"),
                            profile_image_url=profile_image,
                            role=role
                        )
                        
                        if new_user:
                            log.info(f"✅ Usuário do Prodify criado no OpenUIX: {email}")
                            return new_user
            except Exception as e:
                log.error(f"❌ Erro na autenticação Prodify: {e}")
                # Se falhar, continua para autenticação local

        # 🔐 Autenticação Local (fallback)
        user = Users.get_user_by_email(email)
        if not user:
            return None

        try:
            with get_db() as db:
                auth = db.query(Auth).filter_by(id=user.id, active=True).first()
                if auth:
                    if verify_password(password, auth.password):
                        return user
                    else:
                        return None
                else:
                    return None
        except Exception:
            return None

    def authenticate_user_by_api_key(self, api_key: str) -> Optional[UserModel]:
        log.info(f"authenticate_user_by_api_key: {api_key}")
        # if no api_key, return None
        if not api_key:
            return None

        try:
            user = Users.get_user_by_api_key(api_key)
            return user if user else None
        except Exception:
            return False

    def authenticate_user_by_email(self, email: str) -> Optional[UserModel]:
        log.info(f"authenticate_user_by_email: {email}")
        try:
            with get_db() as db:
                auth = db.query(Auth).filter_by(email=email, active=True).first()
                if auth:
                    user = Users.get_user_by_id(auth.id)
                    return user
        except Exception:
            return None

    def update_user_password_by_id(self, id: str, new_password: str) -> bool:
        try:
            with get_db() as db:
                result = (
                    db.query(Auth).filter_by(id=id).update({"password": new_password})
                )
                db.commit()
                return True if result == 1 else False
        except Exception:
            return False

    def update_email_by_id(self, id: str, email: str) -> bool:
        try:
            with get_db() as db:
                result = db.query(Auth).filter_by(id=id).update({"email": email})
                db.commit()
                return True if result == 1 else False
        except Exception:
            return False

    def delete_auth_by_id(self, id: str) -> bool:
        try:
            with get_db() as db:
                # Delete User
                result = Users.delete_user_by_id(id)

                if result:
                    db.query(Auth).filter_by(id=id).delete()
                    db.commit()

                    return True
                else:
                    return False
        except Exception:
            return False


Auths = AuthsTable()
