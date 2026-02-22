import argparse
import os
import random
import requests

THUMBNAILS = [
    "https://res.cloudinary.com/dfc8qcmwi/image/upload/v1771537536/default_1_y6drvz.png",
]

def login(endpoint, email, password):
    query = """
    mutation AdminLogin($input: LoginInput!) {
        login(input: $input)
    }
    """
    variables = {
        "input": {
            "email": email,
            "password": password
        }
    }
    response = requests.post(endpoint, json={"query": query, "variables": variables})
    response.raise_for_status()
    data = response.json()
    if "errors" in data:
        raise Exception(f"Login failed: {data['errors']}")
    return data["data"]["login"]

def create_article(endpoint, token, title, content, category, thumbnail, featured):
    query = """
    mutation CreateArticle($input: NewArticle!) {
        createArticle(input: $input) {
            id
            title
        }
    }
    """
    variables = {
        "input": {
            "title": title,
            "content": content,
            "category": category,
            "thumbnail": thumbnail,
            "featured": featured
        }
    }
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.post(endpoint, json={"query": query, "variables": variables}, headers=headers)
    response.raise_for_status()
    data = response.json()
    if "errors" in data:
        raise Exception(f"Create article failed: {data['errors']}")
    return data["data"]["createArticle"]

def parse_markdown(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    title = "Untitled"
    content_lines = []
    found_title = False
    for line in lines:
        if line.startswith("# ") and not found_title:
            title = line[2:].strip()
            found_title = True
        content_lines.append(line)
    content = "".join(content_lines)
    return title, content

def main():
    parser = argparse.ArgumentParser(description="Ingest Markdown files into Wikinitt.")
    parser.add_argument("--folder", required=True, help="Path to folder with markdown files")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--endpoint", default="http://localhost:8080/query", help="GraphQL API endpoint")
    parser.add_argument("--category", default="Information", help="Default category for articles")
    
    args = parser.parse_args()
    
    print("Logging in...")
    try:
        token = login(args.endpoint, args.email, args.password)
        print("Successfully logged in.")
    except Exception as e:
        print(f"Error logging in: {e}")
        return

    folder_path = args.folder
    if not os.path.exists(folder_path):
        print(f"Error: Folder '{folder_path}' does not exist.")
        return
        
    md_files = [f for f in os.listdir(folder_path) if f.endswith(".md")]
    print(f"Found {len(md_files)} markdown files.")
    
    for filename in md_files:
        filepath = os.path.join(folder_path, filename)
        title, content = parse_markdown(filepath)
        thumbnail = random.choice(THUMBNAILS)
        featured = False
        
        print(f"Uploading '{title}' from {filename}...")
        try:
            res = create_article(
                args.endpoint, token, title, content, 
                args.category, thumbnail, featured
            )
            print(f" -> Success! Article ID: {res['id']}")
        except Exception as e:
            print(f" -> Failed to upload {filename}: {e}")

if __name__ == "__main__":
    main()
