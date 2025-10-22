import requests
import os
import logging

log = logging.getLogger(__name__)

# URL do Prodify (pode ser configurada via variável de ambiente)
PRODIFY_URL = os.getenv('PRODIFY_URL', 'http://prodify-app-dev:8001')

def check_user_credits(user_email: str) -> dict:
    """
    Verifica o saldo de créditos do usuário no Prodify
    
    Returns:
        dict: {
            'success': bool,
            'credits': int,
            'hasCredits': bool,
            'planName': str
        }
    """
    try:
        response = requests.get(
            f'{PRODIFY_URL}/api/external/openuix/credits',
            params={'email': user_email},
            timeout=5
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            log.error(f'Erro ao verificar créditos: {response.status_code} - {response.text}')
            return {
                'success': False,
                'error': 'Erro ao verificar créditos',
                'credits': 0,
                'hasCredits': False
            }
    except Exception as e:
        log.error(f'Exceção ao verificar créditos: {str(e)}')
        return {
            'success': False,
            'error': str(e),
            'credits': 0,
            'hasCredits': False
        }

def consume_user_credits(user_email: str, credits: int = 1) -> dict:
    """
    Consome créditos do usuário no Prodify
    
    Returns:
        dict: {
            'success': bool,
            'credits': int (remaining),
            'consumed': int,
            'message': str
        }
    """
    try:
        response = requests.post(
            f'{PRODIFY_URL}/api/external/openuix/credits',
            json={'email': user_email, 'credits': credits},
            timeout=5
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 402:
            # Créditos insuficientes
            data = response.json()
            return {
                'success': False,
                'error': 'Créditos insuficientes',
                'credits': data.get('credits', 0),
                'required': data.get('required', credits)
            }
        else:
            log.error(f'Erro ao consumir créditos: {response.status_code} - {response.text}')
            return {
                'success': False,
                'error': 'Erro ao consumir créditos'
            }
    except Exception as e:
        log.error(f'Exceção ao consumir créditos: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }

