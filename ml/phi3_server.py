from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from llama_cpp import Llama
import httpx
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time
import os
import json
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

# -----------------------------
# CONFIG
# -----------------------------
LLAMACPP_MODEL_PATH = r"C:\Users\Vaibhav\workspace\DevForge-Minor-Project-\ml\models\Phi-3-mini-128k-instruct.Q4_K_M.gguf"
CPU_THREADS = 4
CONTEXT_SIZE = 4096

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi3:mini"
DEFAULT_MODEL = "llama-cpp"

# Storage
conversation_history: Dict[str, List[Dict]] = {}
user_progress: Dict[str, Dict] = {}  # Track learning progress
project_sessions: Dict[str, Dict] = {}  # Track project work

MAX_HISTORY_LENGTH = 20

print("\n" + "="*60)
print("🚀 Initializing MERN Learning Platform API")
print("="*60)

# Load models (same as before)
llamacpp_model = None
if os.path.exists(LLAMACPP_MODEL_PATH):
    try:
        llamacpp_model = Llama(
            model_path=LLAMACPP_MODEL_PATH,
            n_ctx=CONTEXT_SIZE,
            n_threads=CPU_THREADS,
            n_batch=512,
            verbose=False,
            n_gpu_layers=0,
            use_mlock=True,
            use_mmap=True,
        )
        print(f"✅ llama-cpp model loaded")
    except Exception as e:
        print(f"⚠️  llama-cpp failed: {str(e)}")

async def check_ollama():
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get("http://localhost:11434/api/tags")
            return response.status_code == 200
    except:
        return False

ollama_available = asyncio.run(check_ollama())
print(f"{'✅' if ollama_available else '⚠️ '} Ollama: {'Ready' if ollama_available else 'Not running'}")
print("="*60 + "\n")

executor = ThreadPoolExecutor(max_workers=2)
app = FastAPI(title="MERN Learning Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# ENUMS & TYPES
# -----------------------------

class TaskType(str, Enum):
    DEBUG = "debug"
    REVIEW = "review"
    HINT = "hint"
    TEST = "test"
    EXPLAIN = "explain"
    GUIDE = "guide"

# -----------------------------
# HELPER FUNCTIONS
# -----------------------------

def get_session_history(session_id: str) -> List[Dict]:
    if session_id not in conversation_history:
        conversation_history[session_id] = []
    return conversation_history[session_id]

def add_to_history(session_id: str, role: str, content: str):
    history = get_session_history(session_id)
    history.append({
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat()
    })
    if len(history) > MAX_HISTORY_LENGTH:
        conversation_history[session_id] = history[-MAX_HISTORY_LENGTH:]

def build_system_prompt(task_type: TaskType) -> str:
    """Build specialized system prompts for different tasks"""
    base = "You are an expert MERN stack instructor helping students learn by building projects."
    
    prompts = {
        TaskType.DEBUG: f"{base} Focus on identifying bugs and explaining why they occur.",
        TaskType.REVIEW: f"{base} Provide thorough code review with best practices, security issues, and performance tips.",
        TaskType.HINT: f"{base} Give subtle hints without revealing the full solution. Guide students to think.",
        TaskType.TEST: f"{base} Generate comprehensive test cases including edge cases and error scenarios.",
        TaskType.EXPLAIN: f"{base} Explain concepts clearly with examples, analogies, and practical applications.",
        TaskType.GUIDE: f"{base} Provide step-by-step guidance for building features. Break down complex tasks."
    }
    
    return prompts.get(task_type, base)

def build_prompt_with_history(session_id: str, question: str, code: str = None, task_type: TaskType = TaskType.DEBUG) -> str:
    history = get_session_history(session_id)
    system_msg = build_system_prompt(task_type)
    
    prompt_parts = ["<|system|>", system_msg, "<|end|>"]
    
    for msg in history[-6:]:
        if msg["role"] == "user":
            prompt_parts.extend(["<|user|>", msg["content"], "<|end|>"])
        elif msg["role"] == "assistant":
            prompt_parts.extend(["<|assistant|>", msg["content"], "<|end|>"])
    
    prompt_parts.append("<|user|>")
    prompt_parts.append(question)
    
    if code:
        prompt_parts.append(f"\n\nCode:\n```\n{code}\n```")
    
    prompt_parts.extend(["<|end|>", "<|assistant|>"])
    
    return "\n".join(prompt_parts)

# -----------------------------
# GENERATION FUNCTIONS
# -----------------------------

def generate_with_llamacpp(prompt: str, max_tokens: int = 300, temperature: float = 0.4):
    """Non-streaming generation with llama-cpp"""
    if not llamacpp_model:
        return "Error: llama-cpp model not loaded"
    try:
        response = llamacpp_model(
            prompt, max_tokens=max_tokens, temperature=temperature,
            top_p=0.95, top_k=40, repeat_penalty=1.15,
            stop=["</s>", "<|end|>", "<|user|>"], echo=False
        )
        return response['choices'][0]['text']
    except Exception as e:
        return f"Error: {str(e)}"

def generate_with_llamacpp_stream(prompt: str, max_tokens: int = 300, temperature: float = 0.4):
    """Streaming generation with llama-cpp"""
    if not llamacpp_model:
        yield "Error: llama-cpp model not loaded"
        return
    try:
        stream = llamacpp_model(
            prompt, max_tokens=max_tokens, temperature=temperature,
            top_p=0.95, top_k=40, repeat_penalty=1.15,
            stop=["</s>", "<|end|>", "<|user|>"], echo=False, stream=True
        )
        for output in stream:
            yield output['choices'][0]['text']
    except Exception as e:
        yield f"Error: {str(e)}"

async def generate_with_ollama(prompt: str, max_tokens: int = 300, temperature: float = 0.4):
    """Non-streaming generation with Ollama"""
    payload = {
        "model": OLLAMA_MODEL, "prompt": prompt, "stream": False,
        "options": {
            "num_predict": max_tokens, "temperature": temperature,
            "top_p": 0.95, "top_k": 40, "repeat_penalty": 1.15,
            "stop": ["</s>", "<|end|>", "<|user|>"]
        }
    }
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            return response.json().get("response", "")
    except Exception as e:
        return f"Error: {str(e)}"

async def generate_with_ollama_stream(prompt: str, max_tokens: int = 300, temperature: float = 0.4):
    """Streaming generation with Ollama"""
    payload = {
        "model": OLLAMA_MODEL, "prompt": prompt, "stream": True,
        "options": {
            "num_predict": max_tokens, "temperature": temperature,
            "top_p": 0.95, "top_k": 40, "repeat_penalty": 1.15,
            "stop": ["</s>", "<|end|>", "<|user|>"]
        }
    }
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", OLLAMA_URL, json=payload) as response:
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "response" in data:
                                yield data["response"]
                        except json.JSONDecodeError:
                            continue
    except Exception as e:
        yield f"Error: {str(e)}"

async def generate_response(prompt: str, model_type: str, max_tokens: int, temperature: float):
    """Unified non-streaming generation"""
    if model_type == "ollama":
        return await generate_with_ollama(prompt, max_tokens, temperature)
    else:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            executor, generate_with_llamacpp, prompt, max_tokens, temperature
        )

# -----------------------------
# API ENDPOINTS - CORE LEARNING FEATURES
# -----------------------------

@app.post("/debug-code")
async def debug_code(request: Request):
    """Debug code with detailed error analysis"""
    try:
        data = await request.json()
        question = data.get("question", None)
        code = data.get("code", None)
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not question:
            return {"error": "Missing 'question' field"}
        
        max_tokens = min(data.get("max_new_tokens", 300), 1000)
        temperature = 0.3  # Lower for accurate debugging
        
        formatted_prompt = build_prompt_with_history(session_id, question, code, TaskType.DEBUG)
        
        print(f"🐛 DEBUG - Session: {session_id}, Model: {model_type}")
        start_time = time.time()
        
        result = await generate_response(formatted_prompt, model_type, max_tokens, temperature)
        
        elapsed_time = time.time() - start_time
        
        user_message = f"{question}\n{code}" if code else question
        add_to_history(session_id, "user", user_message)
        add_to_history(session_id, "assistant", result)
        
        return {
            "answer": result.strip(),
            "task_type": "debug",
            "session_id": session_id,
            "model_used": model_type,
            "time_seconds": round(elapsed_time, 2)
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/review-code")
async def review_code(request: Request):
    """Comprehensive code review with best practices"""
    try:
        data = await request.json()
        code = data.get("code", None)
        context = data.get("context", "")  # e.g., "Express API endpoint"
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not code:
            return {"error": "Missing 'code' field"}
        
        question = f"Review this {context} code and provide:\n1. Code quality assessment\n2. Potential bugs or issues\n3. Security concerns\n4. Performance improvements\n5. Best practices recommendations"
        
        max_tokens = min(data.get("max_new_tokens", 500), 1000)
        temperature = 0.4
        
        formatted_prompt = build_prompt_with_history(session_id, question, code, TaskType.REVIEW)
        
        print(f"📝 CODE REVIEW - Session: {session_id}")
        start_time = time.time()
        
        result = await generate_response(formatted_prompt, model_type, max_tokens, temperature)
        elapsed_time = time.time() - start_time
        
        add_to_history(session_id, "user", f"Review:\n{code}")
        add_to_history(session_id, "assistant", result)
        
        return {
            "review": result.strip(),
            "task_type": "review",
            "code_length": len(code),
            "time_seconds": round(elapsed_time, 2)
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/get-hint")
async def get_hint(request: Request):
    """Get subtle hints without revealing the solution"""
    try:
        data = await request.json()
        problem = data.get("problem", None)
        current_code = data.get("current_code", None)
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not problem:
            return {"error": "Missing 'problem' field"}
        
        question = f"Student is stuck on: {problem}\n\nProvide a subtle hint that guides them without giving away the answer. Ask leading questions if helpful."
        
        max_tokens = 150  # Shorter for hints
        temperature = 0.5
        
        formatted_prompt = build_prompt_with_history(session_id, question, current_code, TaskType.HINT)
        
        print(f"💡 HINT - Session: {session_id}")
        start_time = time.time()
        
        result = await generate_response(formatted_prompt, model_type, max_tokens, temperature)
        elapsed_time = time.time() - start_time
        
        add_to_history(session_id, "user", f"Need hint: {problem}")
        add_to_history(session_id, "assistant", result)
        
        return {
            "hint": result.strip(),
            "task_type": "hint",
            "time_seconds": round(elapsed_time, 2)
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate-tests")
async def generate_tests(request: Request):
    """Generate test cases for code"""
    try:
        data = await request.json()
        code = data.get("code", None)
        functionality = data.get("functionality", "")
        test_framework = data.get("framework", "jest")  # jest, mocha, etc.
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not code:
            return {"error": "Missing 'code' field"}
        
        question = f"Generate comprehensive {test_framework} test cases for this {functionality}.\n\nInclude:\n1. Happy path tests\n2. Edge cases\n3. Error scenarios\n4. Boundary conditions"
        
        max_tokens = 400
        temperature = 0.3
        
        formatted_prompt = build_prompt_with_history(session_id, question, code, TaskType.TEST)
        
        print(f"🧪 TEST GENERATION - Session: {session_id}")
        start_time = time.time()
        
        result = await generate_response(formatted_prompt, model_type, max_tokens, temperature)
        elapsed_time = time.time() - start_time
        
        return {
            "test_cases": result.strip(),
            "framework": test_framework,
            "task_type": "test_generation",
            "time_seconds": round(elapsed_time, 2)
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/explain-concept")
async def explain_concept(request: Request):
    """Explain MERN concepts clearly"""
    try:
        data = await request.json()
        concept = data.get("concept", None)
        detail_level = data.get("level", "beginner")  # beginner, intermediate, advanced
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not concept:
            return {"error": "Missing 'concept' field"}
        
        question = f"Explain '{concept}' for a {detail_level} level student. Include:\n1. Clear definition\n2. Why it's important\n3. Practical example\n4. Common mistakes to avoid"
        
        max_tokens = 350
        temperature = 0.6  # Slightly higher for explanations
        
        formatted_prompt = build_prompt_with_history(session_id, question, None, TaskType.EXPLAIN)
        
        print(f"📚 EXPLAIN - Concept: {concept}, Level: {detail_level}")
        start_time = time.time()
        
        result = await generate_response(formatted_prompt, model_type, max_tokens, temperature)
        elapsed_time = time.time() - start_time
        
        add_to_history(session_id, "user", f"Explain: {concept}")
        add_to_history(session_id, "assistant", result)
        
        return {
            "explanation": result.strip(),
            "concept": concept,
            "level": detail_level,
            "task_type": "explain",
            "time_seconds": round(elapsed_time, 2)
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/project-guidance")
async def project_guidance(request: Request):
    """Get step-by-step guidance for building project features"""
    try:
        data = await request.json()
        feature = data.get("feature", None)
        project_type = data.get("project_type", "MERN app")
        current_progress = data.get("progress", "")
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not feature:
            return {"error": "Missing 'feature' field"}
        
        question = f"Guide me to build '{feature}' in a {project_type}.\n\nCurrent progress: {current_progress}\n\nProvide:\n1. Step-by-step breakdown\n2. What files to create/modify\n3. Key concepts needed\n4. Common pitfalls"
        
        max_tokens = 500
        temperature = 0.5
        
        formatted_prompt = build_prompt_with_history(session_id, question, None, TaskType.GUIDE)
        
        print(f"🗺️  GUIDANCE - Feature: {feature}")
        start_time = time.time()
        
        result = await generate_response(formatted_prompt, model_type, max_tokens, temperature)
        elapsed_time = time.time() - start_time
        
        # Track project progress
        if session_id not in project_sessions:
            project_sessions[session_id] = {
                "features": [],
                "started": datetime.now().isoformat()
            }
        project_sessions[session_id]["features"].append({
            "feature": feature,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "guidance": result.strip(),
            "feature": feature,
            "task_type": "guidance",
            "time_seconds": round(elapsed_time, 2)
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/chat")
async def chat(request: Request):
    """General chat for any questions"""
    try:
        data = await request.json()
        message = data.get("message", None)
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not message:
            return {"error": "Missing 'message' field"}
        
        max_tokens = min(data.get("max_new_tokens", 250), 1000)
        temperature = 0.5
        
        formatted_prompt = build_prompt_with_history(session_id, message, None, TaskType.EXPLAIN)
        
        start_time = time.time()
        result = await generate_response(formatted_prompt, model_type, max_tokens, temperature)
        elapsed_time = time.time() - start_time
        
        add_to_history(session_id, "user", message)
        add_to_history(session_id, "assistant", result)
        
        return {
            "response": result.strip(),
            "time_seconds": round(elapsed_time, 2)
        }
        
    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# STREAMING ENDPOINTS
# -----------------------------

@app.post("/debug-code-stream")
async def debug_code_stream(request: Request):
    """Debug code with streaming response"""
    try:
        data = await request.json()
        question = data.get("question", None)
        code = data.get("code", None)
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not question:
            return {"error": "Missing 'question' field"}
        
        max_tokens = min(data.get("max_new_tokens", 300), 1000)
        temperature = 0.3
        
        formatted_prompt = build_prompt_with_history(session_id, question, code, TaskType.DEBUG)
        user_message = f"{question}\n{code}" if code else question
        add_to_history(session_id, "user", user_message)
        
        print(f"🌊 DEBUG STREAM - Session: {session_id}, Model: {model_type}")
        
        async def stream_generator():
            collected_response = []
            try:
                if model_type == "ollama":
                    async for token in generate_with_ollama_stream(formatted_prompt, max_tokens, temperature):
                        collected_response.append(token)
                        yield f"data: {json.dumps({'token': token, 'task': 'debug'})}\n\n"
                else:
                    loop = asyncio.get_event_loop()
                    stream = await loop.run_in_executor(
                        executor, 
                        lambda: generate_with_llamacpp_stream(formatted_prompt, max_tokens, temperature)
                    )
                    for token in stream:
                        collected_response.append(token)
                        yield f"data: {json.dumps({'token': token, 'task': 'debug'})}\n\n"
                
                full_response = "".join(collected_response)
                add_to_history(session_id, "assistant", full_response)
                yield f"data: {json.dumps({'done': True, 'session_id': session_id})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    except Exception as e:
        return {"error": str(e)}

@app.post("/review-code-stream")
async def review_code_stream(request: Request):
    """Code review with streaming response"""
    try:
        data = await request.json()
        code = data.get("code", None)
        context = data.get("context", "")
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not code:
            return {"error": "Missing 'code' field"}
        
        question = f"Review this {context} code and provide:\n1. Code quality\n2. Issues\n3. Security\n4. Performance\n5. Best practices"
        max_tokens = 500
        temperature = 0.4
        
        formatted_prompt = build_prompt_with_history(session_id, question, code, TaskType.REVIEW)
        add_to_history(session_id, "user", f"Review:\n{code}")
        
        print(f"🌊 REVIEW STREAM - Session: {session_id}")
        
        async def stream_generator():
            collected_response = []
            try:
                if model_type == "ollama":
                    async for token in generate_with_ollama_stream(formatted_prompt, max_tokens, temperature):
                        collected_response.append(token)
                        yield f"data: {json.dumps({'token': token, 'task': 'review'})}\n\n"
                else:
                    loop = asyncio.get_event_loop()
                    stream = await loop.run_in_executor(
                        executor,
                        lambda: generate_with_llamacpp_stream(formatted_prompt, max_tokens, temperature)
                    )
                    for token in stream:
                        collected_response.append(token)
                        yield f"data: {json.dumps({'token': token, 'task': 'review'})}\n\n"
                
                full_response = "".join(collected_response)
                add_to_history(session_id, "assistant", full_response)
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    except Exception as e:
        return {"error": str(e)}

@app.post("/explain-concept-stream")
async def explain_concept_stream(request: Request):
    """Explain concepts with streaming"""
    try:
        data = await request.json()
        concept = data.get("concept", None)
        detail_level = data.get("level", "beginner")
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not concept:
            return {"error": "Missing 'concept' field"}
        
        question = f"Explain '{concept}' for {detail_level} level. Include: definition, importance, example, common mistakes"
        max_tokens = 350
        temperature = 0.6
        
        formatted_prompt = build_prompt_with_history(session_id, question, None, TaskType.EXPLAIN)
        add_to_history(session_id, "user", f"Explain: {concept}")
        
        print(f"🌊 EXPLAIN STREAM - Concept: {concept}")
        
        async def stream_generator():
            collected_response = []
            try:
                if model_type == "ollama":
                    async for token in generate_with_ollama_stream(formatted_prompt, max_tokens, temperature):
                        collected_response.append(token)
                        yield f"data: {json.dumps({'token': token, 'task': 'explain'})}\n\n"
                else:
                    loop = asyncio.get_event_loop()
                    stream = await loop.run_in_executor(
                        executor,
                        lambda: generate_with_llamacpp_stream(formatted_prompt, max_tokens, temperature)
                    )
                    for token in stream:
                        collected_response.append(token)
                        yield f"data: {json.dumps({'token': token, 'task': 'explain'})}\n\n"
                
                full_response = "".join(collected_response)
                add_to_history(session_id, "assistant", full_response)
                yield f"data: {json.dumps({'done': True, 'concept': concept})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    except Exception as e:
        return {"error": str(e)}

@app.post("/chat-stream")
async def chat_stream(request: Request):
    """Chat with streaming response"""
    try:
        data = await request.json()
        message = data.get("message", None)
        session_id = data.get("session_id", "default")
        model_type = data.get("model", DEFAULT_MODEL)
        
        if not message:
            return {"error": "Missing 'message' field"}
        
        max_tokens = min(data.get("max_new_tokens", 250), 1000)
        temperature = 0.5
        
        formatted_prompt = build_prompt_with_history(session_id, message, None, TaskType.EXPLAIN)
        add_to_history(session_id, "user", message)
        
        print(f"🌊 CHAT STREAM - Session: {session_id}")
        
        async def stream_generator():
            collected_response = []
            try:
                if model_type == "ollama":
                    async for token in generate_with_ollama_stream(formatted_prompt, max_tokens, temperature):
                        collected_response.append(token)
                        yield f"data: {json.dumps({'token': token})}\n\n"
                else:
                    loop = asyncio.get_event_loop()
                    stream = await loop.run_in_executor(
                        executor,
                        lambda: generate_with_llamacpp_stream(formatted_prompt, max_tokens, temperature)
                    )
                    for token in stream:
                        collected_response.append(token)
                        yield f"data: {json.dumps({'token': token})}\n\n"
                
                full_response = "".join(collected_response)
                add_to_history(session_id, "assistant", full_response)
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# PROGRESS & ANALYTICS ENDPOINTS
# -----------------------------

@app.get("/progress/{session_id}")
async def get_progress(session_id: str):
    """Get student's learning progress"""
    history = get_session_history(session_id)
    project = project_sessions.get(session_id, {})
    
    # Analyze interactions
    task_counts = {
        "debug": 0,
        "review": 0,
        "hint": 0,
        "test": 0,
        "explain": 0,
        "chat": 0
    }
    
    for msg in history:
        content = msg.get("content", "").lower()
        if "debug" in content or "error" in content:
            task_counts["debug"] += 1
        elif "review" in content:
            task_counts["review"] += 1
        elif "hint" in content:
            task_counts["hint"] += 1
        elif "test" in content:
            task_counts["test"] += 1
        elif "explain" in content:
            task_counts["explain"] += 1
    
    return {
        "session_id": session_id,
        "total_interactions": len(history),
        "task_breakdown": task_counts,
        "project_features": project.get("features", []),
        "project_started": project.get("started", None),
        "last_activity": history[-1]["timestamp"] if history else None
    }

@app.get("/history/{session_id}")
async def get_history(session_id: str):
    """Get conversation history"""
    history = get_session_history(session_id)
    return {
        "session_id": session_id,
        "message_count": len(history),
        "history": history
    }

@app.delete("/history/{session_id}")
async def delete_history(session_id: str):
    """Clear history"""
    if session_id in conversation_history:
        del conversation_history[session_id]
    if session_id in project_sessions:
        del project_sessions[session_id]
    return {"message": f"History cleared for session {session_id}"}

@app.get("/sessions")
async def list_sessions():
    """List all active sessions"""
    return {
        "active_sessions": list(conversation_history.keys()),
        "total_sessions": len(conversation_history),
        "sessions_with_projects": len(project_sessions)
    }

@app.get("/models")
async def list_models():
    """List available models"""
    return {
        "available_models": {
            "llama-cpp": {
                "status": "available" if llamacpp_model else "not_loaded",
                "speed": "~3-5 tok/s",
                "recommended_for": ["debugging", "code_review"]
            },
            "ollama": {
                "status": "available" if ollama_available else "not_running",
                "speed": "~8-15 tok/s",
                "recommended_for": ["hints", "explanations", "chat"]
            }
        },
        "default_model": DEFAULT_MODEL
    }

@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "models": {
            "llama-cpp": "ready" if llamacpp_model else "unavailable",
            "ollama": "ready" if ollama_available else "unavailable"
        },
        "active_sessions": len(conversation_history),
        "active_projects": len(project_sessions)
    }

@app.get("/")
async def root():
    """API documentation"""
    return {
        "message": "MERN Learning Platform API",
        "version": "1.0",
        "description": "AI-powered learning platform for MERN stack with project-based learning",
        "features": [
            "✅ Code debugging",
            "✅ Code review",
            "✅ Hints (without giving away answers)",
            "✅ Test case generation",
            "✅ Concept explanations",
            "✅ Project guidance",
            "✅ Progress tracking",
            "✅ Dual model support"
        ],
        "endpoints": {
            "learning": {
                "POST /debug-code": "Debug code errors",
                "POST /debug-code-stream": "Debug with streaming ⚡",
                "POST /review-code": "Comprehensive code review",
                "POST /review-code-stream": "Review with streaming ⚡",
                "POST /get-hint": "Get subtle hints",
                "POST /generate-tests": "Generate test cases",
                "POST /explain-concept": "Explain MERN concepts",
                "POST /explain-concept-stream": "Explain with streaming ⚡",
                "POST /project-guidance": "Step-by-step project guidance",
                "POST /chat": "General chat/questions",
                "POST /chat-stream": "Chat with streaming ⚡"
            },
            "progress": {
                "GET /progress/{session_id}": "Get learning progress",
                "GET /history/{session_id}": "Get conversation history",
                "DELETE /history/{session_id}": "Clear history"
            },
            "system": {
                "GET /models": "List available models",
                "GET /sessions": "List active sessions",
                "GET /health": "Health check"
            }
        },
        "example_usage": {
            "debug": {
                "url": "POST /debug-code",
                "body": {
                    "question": "Why is this giving an error?",
                    "code": "const user = await User.create(req.body);",
                    "session_id": "student123",
                    "model": "ollama",
                    "max_new_tokens": 300
                }
            },
            "hint": {
                "url": "POST /get-hint",
                "body": {
                    "problem": "How do I handle async errors in Express?",
                    "session_id": "student123",
                    "model": "ollama"
                }
            },
            "explain": {
                "url": "POST /explain-concept",
                "body": {
                    "concept": "JWT authentication",
                    "level": "beginner",
                    "session_id": "student123"
                }
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60)
    print("🎓 STARTING MERN LEARNING PLATFORM API")
    print("="*60)
    print(f"🌐 Server: http://localhost:8000")
    print(f"📚 Docs: http://localhost:8000/docs")
    print(f"🎯 Features: 7 learning endpoints + progress tracking")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)