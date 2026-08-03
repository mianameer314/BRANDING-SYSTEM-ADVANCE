"""
Prompt Builders.
Constructs strict system prompts and context-aware user prompts for each content type.
"""
import json
from app.schemas.ai import GenerateContentRequest

def build_system_prompt(content_type: str, preset: str | None) -> str:
    """Builds the core system instructions."""
    
    base_instructions = (
        "You are an expert CMS content generation assistant.\n"
        "Your sole purpose is to generate high-quality, structured content based on user parameters.\n\n"
        "CRITICAL RULES:\n"
        "1. Output valid JSON ONLY. No markdown wrapping, no explanatory text, no conversational text.\n"
        "2. Generate content in plain text. DO NOT use HTML tags (e.g., no <p>, <h2>, <strong>).\n"
        "3. Follow the requested tone, language, and audience constraints strictly.\n"
    )
    
    preset_modifier = ""
    if preset == "quick_draft":
        preset_modifier = "Keep it concise, punchy, and direct. Focus on speed and core facts."
    elif preset == "seo_optimized":
        preset_modifier = "Focus heavily on SEO. Seamlessly integrate keywords. Optimize headings and meta descriptions."
    elif preset == "thought_leadership":
        preset_modifier = "Adopt an executive, authoritative voice. Focus on data-driven insights and industry trends."
    elif preset == "technical_article":
        preset_modifier = "Use technical language appropriate for developers and engineers. Be precise and detail-oriented."
    elif preset == "marketing_copy":
        preset_modifier = "Use persuasive, benefit-oriented language. Focus on conversions and strong Calls to Action."
        
    schema_definition = ""
    if content_type == "blog":
        schema_definition = (
            "Ensure your JSON strictly matches this schema:\n"
            "{\n"
            '  "title": "String (max 200 chars)",\n'
            '  "excerpt": "String (short summary)",\n'
            '  "content": "String (main body text, plain text with newlines for paragraphs)",\n'
            '  "tags": ["String", "String"],\n'
            '  "category": "String (single category name)",\n'
            '  "meta_description": "String (SEO meta description)",\n'
            '  "seo_keywords": ["String", "String"]\n'
            "}"
        )
    elif content_type == "news":
        schema_definition = (
            "Ensure your JSON strictly matches this schema:\n"
            "{\n"
            '  "headline": "String (max 150 chars)",\n'
            '  "summary": "String (main body text of the news article, plain text)",\n'
            '  "meta_description": "String (SEO meta description)"\n'
            "}"
        )
    elif content_type == "project":
        schema_definition = (
            "Ensure your JSON strictly matches this schema:\n"
            "{\n"
            '  "name": "String (max 200 chars)",\n'
            '  "description": "String (main body text, plain text)",\n'
            '  "short_desc": "String (short summary, max 300 chars)",\n'
            '  "technologies": ["String", "String"],\n'
            '  "category": "String (single category name)"\n'
            "}"
        )
    elif content_type == "insight":
        schema_definition = (
            "Ensure your JSON strictly matches this schema:\n"
            "{\n"
            '  "title": "String (max 200 chars)",\n'
            '  "excerpt": "String (short summary)",\n'
            '  "content": "String (main body text, plain text)",\n'
            '  "tags": ["String", "String"],\n'
            '  "category": "String (single category name)",\n'
            '  "meta_description": "String (SEO meta description)"\n'
            "}"
        )
    elif content_type == "case_study":
        schema_definition = (
            "Ensure your JSON strictly matches this schema:\n"
            "{\n"
            '  "title": "String (max 200 chars)",\n'
            '  "client_name": "String",\n'
            '  "industry": "String",\n'
            '  "challenge": "String (plain text)",\n'
            '  "solution": "String (plain text)",\n'
            '  "results": "String (plain text)",\n'
            '  "technologies": ["String", "String"],\n'
            '  "metrics": [{"label": "String", "value": "String"}], (e.g. label: "Revenue Increase", value: "40%")\n'
            '  "testimonial": "String (a realistic fictional quote)",\n'
            '  "testimonial_author": "String (Name, Title)"\n'
            "}"
        )

    return f"{base_instructions}\n\nPRESET INSTRUCTIONS:\n{preset_modifier}\n\nSCHEMA:\n{schema_definition}"


def build_user_prompt(request: GenerateContentRequest) -> str:
    """Builds the context-aware user prompt."""
    
    # Exclude None values and internal config like content_type
    params = request.model_dump(exclude_none=True, exclude={"content_type", "preset"})
    
    # Format nicely for the LLM
    formatted_params = json.dumps(params, indent=2)
    
    return f"Please generate content based on the following parameters:\n{formatted_params}"


def build_prompts(request: GenerateContentRequest) -> tuple[str, str]:
    """Returns (system_prompt, user_prompt) based on the request."""
    system_prompt = build_system_prompt(request.content_type, request.preset)
    user_prompt = build_user_prompt(request)
    return system_prompt, user_prompt
