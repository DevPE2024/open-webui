"""
Sincronização de usuários entre Prodify e OpenUIX
"""
import psycopg2
import os
import logging
from typing import Optional, Dict
from datetime import datetime

log = logging.getLogger(__name__)

# Configurações do banco Prodify (PostgreSQL)
PRODIFY_DB_CONFIG = {
    'host': os.getenv('PRODIFY_DB_HOST', 'prodify-db'),
    'port': int(os.getenv('PRODIFY_DB_PORT', '5432')),
    'database': os.getenv('PRODIFY_DB_NAME', 'super_productive'),
    'user': os.getenv('PRODIFY_DB_USER', 'postgres'),
    'password': os.getenv('PRODIFY_DB_PASSWORD', 'password')
}

def get_prodify_user(email: str) -> Optional[Dict]:
    """
    Busca um usuário no banco do Prodify
    
    Returns:
        dict com dados do usuário ou None se não encontrar
    """
    try:
        log.info(f"get_prodify_user: Buscando {email} no Prodify...")
        conn = psycopg2.connect(**PRODIFY_DB_CONFIG)
        cursor = conn.cursor()
        
        # Buscar usuário no Prodify
        cursor.execute('''
            SELECT 
                id, 
                email, 
                username, 
                name, 
                "hashedPassword",
                "completedOnboarding"
            FROM "User"
            WHERE email = %s AND "hashedPassword" IS NOT NULL
        ''', (email,))
        
        user_data = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user_data:
            log.info(f"get_prodify_user: Usuário {email} encontrado!")
            log.debug(f"  ID: {user_data[0]}")
            log.debug(f"  Username: {user_data[2]}")
            log.debug(f"  Hash: {user_data[4][:30] if user_data[4] else 'None'}...")
            
            return {
                'id': user_data[0],
                'email': user_data[1],
                'username': user_data[2],
                'name': user_data[3],
                'hashed_password': user_data[4],
                'completed_onboarding': user_data[5]
            }
        
        log.warning(f"get_prodify_user: Usuário {email} NÃO encontrado")
        return None
        
    except Exception as e:
        log.error(f"Erro ao buscar usuário do Prodify: {e}")
        import traceback
        traceback.print_exc()
        return None

def verify_prodify_password(email: str, password: str) -> bool:
    """
    Verifica senha no Prodify usando bcrypt
    """
    try:
        import bcrypt
        
        prodify_user = get_prodify_user(email)
        if not prodify_user:
            log.warning(f"verify_prodify_password: Usuário {email} não encontrado no Prodify")
            return False
        
        # Verificar senha com bcrypt
        hashed_password_str = prodify_user['hashed_password']
        log.info(f"verify_prodify_password: Verificando senha para {email}")
        log.info(f"  Hash do Prodify (str): {hashed_password_str}")
        log.info(f"  Hash length: {len(hashed_password_str)}")
        log.info(f"  Senha fornecida length: {len(password)}")
        
        # Converter para bytes
        hashed_bytes = hashed_password_str.encode('utf-8')
        password_bytes = password.encode('utf-8')
        
        log.info(f"  Hash bytes: {hashed_bytes}")
        log.info(f"  Senha bytes: {password_bytes}")
        
        # Verificar
        result = bcrypt.checkpw(password_bytes, hashed_bytes)
        log.info(f"verify_prodify_password: Resultado bcrypt.checkpw = {result}")
        
        return result
        
    except Exception as e:
        log.error(f"Erro ao verificar senha do Prodify: {e}")
        import traceback
        traceback.print_exc()
        return False

def sync_user_to_openuix(email: str, password: str = None) -> Optional[Dict]:
    """
    Sincroniza usuário do Prodify para o OpenUIX
    Cria o usuário no OpenUIX se não existir
    
    Returns:
        dict com dados do usuário sincronizado ou None em caso de erro
    """
    try:
        from open_webui.models.users import Users
        import bcrypt
        
        # Criar hash de senha usando bcrypt
        def get_password_hash(password: str) -> str:
            return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Buscar usuário no Prodify
        prodify_user = get_prodify_user(email)
        if not prodify_user:
            log.warning(f"Usuário {email} não encontrado no Prodify")
            return None
        
        # Verificar se usuário já existe no OpenUIX
        existing_user = Users.get_user_by_email(email)
        
        if existing_user:
            log.info(f"Usuário {email} já existe no OpenUIX, atualizando dados...")
            # Atualizar dados do usuário
            Users.update_user_by_id(
                existing_user.id,
                {
                    "name": prodify_user['name'],
                    "profile_image_url": f"/user.png"
                }
            )
            return existing_user
        
        # Criar novo usuário no OpenUIX
        log.info(f"Criando usuário {email} no OpenUIX...")
        
        # Gerar hash da senha se fornecida, ou usar a do Prodify
        if password:
            password_hash = get_password_hash(password)
        else:
            # Usar o hash do Prodify (bcrypt é compatível)
            password_hash = prodify_user['hashed_password']
        
        # Determinar role (admin se for o primeiro usuário ou se for admin no Prodify)
        user_count = Users.get_num_users()
        role = "admin" if user_count == 0 else "user"
        
        # Gerar ID único para o usuário
        import uuid
        user_id = str(uuid.uuid4())
        
        # Criar usuário usando o método correto do OpenUIX
        new_user = Users.insert_new_user(
            id=user_id,
            name=prodify_user['name'] or prodify_user['username'],
            email=email,
            profile_image_url="/user.png",
            role=role
        )
        
        # Atualizar senha manualmente
        if new_user:
            Users.update_user_by_id(
                new_user.id,
                {"password": password_hash}
            )
        
        log.info(f"✅ Usuário {email} criado com sucesso no OpenUIX!")
        return new_user
        
    except Exception as e:
        log.error(f"❌ Erro ao sincronizar usuário {email}: {e}")
        import traceback
        traceback.print_exc()
        return None

def authenticate_with_prodify(email: str, password: str) -> Optional[Dict]:
    """
    Autentica usuário usando o Prodify e sincroniza para o OpenUIX
    
    Returns:
        dict com dados do usuário ou None se falhar
    """
    try:
        log.info(f"authenticate_with_prodify: email={email}, password_length={len(password)}")
        
        # Verificar credenciais no Prodify
        if not verify_prodify_password(email, password):
            log.warning(f"Credenciais inválidas para {email}")
            return None
        
        # Sincronizar usuário para o OpenUIX
        user = sync_user_to_openuix(email, password)
        
        if user:
            log.info(f"✅ Autenticação e sincronização bem-sucedida para {email}")
            return user
        
        return None
        
    except Exception as e:
        log.error(f"❌ Erro na autenticação com Prodify: {e}")
        return None

