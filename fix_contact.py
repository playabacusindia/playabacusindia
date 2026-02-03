import os
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def get_chunk(content, start_marker, end_marker):
    start = content.find(start_marker)
    if start == -1:
        return None
    end = content.find(end_marker, start)
    if end == -1:
        return None
    return content[start:end + len(end_marker)]

def main():
    base_dir = r"c:\Users\navee\OneDrive\Documents\IPA\playabacusindia"
    contact_path = os.path.join(base_dir, "contact-us.html")
    index_path = os.path.join(base_dir, "index.html")

    contact_content = read_file(contact_path)
    index_content = read_file(index_path)

    # 1. Extract Header from index.html
    header_start = '<header id="header">'
    header_end = '</header>'
    header_new = get_chunk(index_content, header_start, header_end)
    
    if not header_new:
        print("Error: Could not find header in index.html")
        return

    # 2. Extract Footer from index.html (from footer tag to end of file)
    footer_start = '<footer class="container-fluid pt-5 px-0">'
    footer_idx = index_content.find(footer_start)
    if footer_idx == -1:
         print("Error: Could not find footer in index.html")
         return
    footer_new = index_content[footer_idx:]

    # 3. Replace Header in contact-us.html
    contact_header_start = '<header id="header">'
    contact_header_end = '</header>'
    # We use regex to replace because indentation might differ
    # But since we want to replace the whole block, finding start and end is safer
    c_h_start_idx = contact_content.find(contact_header_start)
    c_h_end_idx = contact_content.find(contact_header_end, c_h_start_idx)
    
    if c_h_start_idx != -1 and c_h_end_idx != -1:
        contact_content = contact_content[:c_h_start_idx] + header_new + contact_content[c_h_end_idx + len(contact_header_end):]
        print("Header replaced.")
    else:
        print("Warning: Header not found in contact-us.html")

    # 4. Replace Footer in contact-us.html
    # Find footer start, allowing for potential minor differences or just use the tag
    # contact-us might have different class in footer? No, checked earlier, it's same structure.
    # But let's verify contact-us footer tag.
    # Step 109 shows: <footer class="container-fluid pt-5 px-0">
    c_footer_idx = contact_content.find(footer_start)
    if c_footer_idx != -1:
        contact_content = contact_content[:c_footer_idx] + footer_new
        print("Footer replaced.")
    else:
        print("Warning: Footer not found in contact-us.html. Appending to end? No, unsafe.")
        # Try finding just <footer if the class is different
        c_footer_idx_simple = contact_content.find('<footer')
        if c_footer_idx_simple != -1:
             contact_content = contact_content[:c_footer_idx_simple] + footer_new
             print("Footer replaced (fuzzy match).")
        else:
             print("Error: Footer tag not found.")

    # 5. Fix Form
    # We look for the unique problematic code
    # <div name="country-codes" id="country-select"> is very unique.
    # We need to replace its parent div.
    # The parent div has style="display: flex; align-items:center; gap:1rem; width:100%;"
    
    # We can use regex to find this block.
    # Pattern: <div style="display: flex;[^>]*>.*?id="country-select".*?</div>\s*<input[^>]*>\s*</div>
    
    pattern = re.compile(r'<div style="display: flex; align-items:center; gap:1rem; width:100%;">\s*<div name="country-codes" id="country-select">.*?</div>\s*<input id="tele-phone"[^>]*>\s*</div>', re.DOTALL)
    
    replacement = '''<div class="input-group">
                                    <span class="input-group-text bg-light border-end-0">
                                        <img src="https://flagcdn.com/w20/in.png" alt="India" style="width: 20px;">
                                        <span class="ms-1 small">+91</span>
                                    </span>
                                    <input id="tele-phone" class="form-control border-start-0 ps-0" placeholder="Phone Number"
                                        required type="tel">
                                </div>'''

    contact_content, count = pattern.subn(replacement, contact_content)
    if count > 0:
        print(f"Form fixed. Replaced {count} instance(s).")
    else:
        print("Warning: Form pattern not found.")

    write_file(contact_path, contact_content)
    print("contact-us.html updated successfully.")

if __name__ == "__main__":
    main()
