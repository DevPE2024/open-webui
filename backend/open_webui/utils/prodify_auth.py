"""
Integração de Autenticação com Prodify
Permite que usuários do Prodify façam login no OpenUIX automaticamente
"""

import logging
import os
from typing import Optional, Dict

# Importar apenas se disponível
try:
    import psycopg2
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False

log = logging.getLogger(__name__)

# Configuração do banco de dados Prodify (via variáveis de ambiente)
PRODIFY_DB_CONFIG = {
    "host": os.getenv("PRODIFY_DB_HOST", "localhost"),
    "port": os.getenv("PRODIFY_DB_PORT", "8010"),
    "database": os.getenv("PRODIFY_DB_NAME", "super_productive"),
    "user": os.getenv("PRODIFY_DB_USER", "postgres"),
    "password": os.getenv("PRODIFY_DB_PASSWORD", "password")
}

# Verificar se integração está habilitada
PRODIFY_AUTH_ENABLED = os.getenv("PRODIFY_AUTH_ENABLED", "false").lower() == "true"


class ProdifyAuth:
    """Classe para autenticação com banco de dados do Prodify"""
    
    @staticmethod
    def get_connection():
        """Cria conexão com o banco de dados do Prodify"""
        if not PSYCOPG2_AVAILABLE:
            log.warning("psycopg2 não está instalado. Integração Prodify desabilitada.")
            return None
            
        if not PRODIFY_AUTH_ENABLED:
            log.debug("Integração Prodify desabilitada por configuração.")
            return None
            
        try:
            conn = psycopg2.connect(**PRODIFY_DB_CONFIG)
            return conn
        except Exception as e:
            log.error(f"Erro ao conectar ao Prodify DB: {e}")
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        """
        Busca usuário no banco do Prodify por email
        
        Args:
            email: Email do usuário
            
        Returns:
            Dict com dados do usuário ou None
        """
        conn = None
        try:
            conn = ProdifyAuth.get_connection()
            if not conn:
                return None
            
            cursor = conn.cursor()
            
            # Query para buscar usuário
            query = """
                SELECT id, name, surname, username, email, "hashedPassword", image
                FROM "User"
                WHERE email = %s
            """
            
            cursor.execute(query, (email,))
            result = cursor.fetchone()
            
            if result:
                return {
                    "id": result[0],
                    "name": result[1],
                    "surname": result[2],
                    "username": result[3],
                    "email": result[4],
                    "hashed_password": result[5],
                    "image": result[6]
                }
            
            return None
            
        except Exception as e:
            log.error(f"Erro ao buscar usuário do Prodify: {e}")
            return None
        finally:
            if conn:
                conn.close()
    
    @staticmethod
    def get_user_by_username(username: str) -> Optional[Dict]:
        """
        Busca usuário no banco do Prodify por username
        
        Args:
            username: Username do usuário
            
        Returns:
            Dict com dados do usuário ou None
        """
        conn = None
        try:
            conn = ProdifyAuth.get_connection()
            if not conn:
                return None
            
            cursor = conn.cursor()
            
            # Query para buscar usuário
            query = """
                SELECT id, name, surname, username, email, "hashedPassword", image
                FROM "User"
                WHERE username = %s
            """
            
            cursor.execute(query, (username,))
            result = cursor.fetchone()
            
            if result:
                return {
                    "id": result[0],
                    "name": result[1],
                    "surname": result[2],
                    "username": result[3],
                    "email": result[4],
                    "hashed_password": result[5],
                    "image": result[6]
                }
            
            return None
            
        except Exception as e:
            log.error(f"Erro ao buscar usuário do Prodify: {e}")
            return None
        finally:
            if conn:
                conn.close()
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verifica senha usando bcrypt (mesmo método do Prodify)
        
        Args:
            plain_password: Senha em texto plano
            hashed_password: Hash da senha
            
        Returns:
            True se a senha estiver correta
        """
        if not BCRYPT_AVAILABLE:
            log.error("bcrypt não está disponível. Não é possível verificar senha do Prodify.")
            return False
            
        try:
            # O Prodify usa bcrypt para hash de senhas
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception as e:
            log.error(f"Erro ao verificar senha: {e}")
            return False
    
    @staticmethod
    def authenticate_prodify_user(email: str, password: str) -> Optional[Dict]:
        """
        Autentica usuário do Prodify
        
        Args:
            email: Email ou username do usuário
            password: Senha em texto plano
            
        Returns:
            Dict com dados do usuário se autenticado, None caso contrário
        """
        # Tenta primeiro por email
        user = ProdifyAuth.get_user_by_email(email.lower())
        
        # Se não encontrar por email, tenta por username
        if not user:
            user = ProdifyAuth.get_user_by_username(email)
        
        if not user:
            log.info(f"Usuário não encontrado no Prodify: {email}")
            return None
        
        # Verifica a senha
        if not user.get("hashed_password"):
            log.warning(f"Usuário sem senha definida: {email}")
            return None
        
        if ProdifyAuth.verify_password(password, user["hashed_password"]):
            log.info(f"Usuário autenticado com sucesso no Prodify: {email}")
            return user
        else:
            log.warning(f"Senha incorreta para usuário do Prodify: {email}")
            return None

