#!/usr/bin/env python3
"""Imports the Real-Time CDP Developer Expert (AD0-E605) and Journey Optimizer Developer
Expert (AD0-E606) tracks from the source files in original-sources/.

    python3 tools/import_new_tracks.py

Writes complete study guides, graded practice sets (from the questions and answer keys
that are in the guides), a review-only question bank, and the data files the portal reads.
"""
import json, pathlib, re, shutil
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "original-sources"

def norm_ws(t):
    return re.sub(r"\s+", " ", t).strip()

def ensure_heading_ids(soup):
    """Give every h3 an id (only where it has none) so the portal can link to it."""
    used = {x.get("id") for x in soup.find_all(True) if x.get("id")}
    for h in soup.find_all("h3"):
        if not h.get("id"):
            base = "h-" + re.sub(r"[^a-z0-9]+", "-", h.get_text(" ", strip=True).lower()).strip("-")[:60]
            cand, n = base, 1
            while cand in used:
                n += 1
                cand = f"{base}-{n}"
            h["id"] = cand
            used.add(cand)

def write_guide(src_name, out_name):
    soup = BeautifulSoup((SRC / src_name).read_text(encoding="utf8"), "html.parser")
    ensure_heading_ids(soup)
    (ROOT / out_name).write_text(str(soup), encoding="utf8")
    return soup

def sections(soup):
    return [s for s in soup.select("section[id]")]

def h2(section):
    h = section.find("h2")
    return norm_ws(h.get_text(" ", strip=True)) if h else section["id"]

def first_para(section):
    for p in section.find_all("p"):
        t = norm_ws(p.get_text(" ", strip=True))
        if len(t) > 40:
            return t
    return ""

# ---------------------------------------------------------------- AJO Developer Expert
def build_ajo():
    soup = write_guide("AD0-E606_AJO_Developer_Expert_Comprehensive_Study_Guide.html",
                       "Complete_Study_Guide_AD0-E606.html")
    js = max((s.get_text() for s in soup.find_all("script")), key=len)
    m = re.search(r"const qs=\[(.*?)\];", js, re.S)
    qs_js = "[" + m.group(1) + "]"
    # The script is plain JavaScript data (arrays of [question, options, correctIndex, explanation]).
    items = json.loads(subprocess_eval(qs_js))
    questions = []
    for i, (q, options, correct, expl) in enumerate(items, 1):
        letters = "abcdefgh"
        questions.append({
            "id": f"ad0-e606-practice-{i:03d}", "chapterId": None, "domainId": None,
            "topic": "Journey Optimizer Developer Expert", "difficulty": "professional", "type": "single",
            "question": q,
            "options": [{"id": f"opt-{letters[j]}", "text": t} for j, t in enumerate(options)],
            "correctAnswers": [f"opt-{letters[correct]}"],
            "explanation": expl, "incorrectExplanations": {},
            "explanationSource": "Complete_Study_Guide_AD0-E606.html (practice questions)",
        })
    chapters = []
    domains = []
    for s in sections(soup):
        if s["id"] in ("start", "quiz", "check", "sources"):
            continue
        title = h2(s)
        topics = [norm_ws(h.get_text(" ", strip=True)) for h in s.find_all("h3")]
        chapters.append({"id": s["id"], "title": title, "domain": title,
                         "overview": first_para(s), "topics": topics, "content": ""})
        mm = re.match(r"^\d+\.\s+(.+?)\s+(\d+)%$", title)
        if mm:
            domains.append({"name": mm.group(1), "weight": int(mm.group(2)), "keyTopics": topics})
    logistics = ""
    for p in soup.find_all(string=re.compile("Exam logistics")):
        logistics = norm_ws(p.parent.get_text(" ", strip=True))
        break
    exam = {"certificationId": "ad0-e606", "code": "AD0-E606",
            "name": "Adobe Journey Optimizer Developer Expert",
            "specifications": {"totalQuestions": len(questions)},
            "examLogistics": logistics, "domains": domains}
    return soup, exam, chapters, questions

def subprocess_eval(js_array_literal):
    import subprocess, tempfile, os
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf8") as f:
        f.write("const v=" + js_array_literal + ";console.log(JSON.stringify(v));")
        path = f.name
    try:
        return subprocess.run(["node", path], capture_output=True, text=True, check=True).stdout
    finally:
        os.unlink(path)

# ---------------------------------------------------------------- Real-Time CDP Developer Expert
def build_rtcdp():
    soup = write_guide("Adobe_RTCDP_Architect_Comprehensive_Study_Guide.html",
                       "Complete_Study_Guide_AD0-E605.html")
    questions = []
    quiz = soup.select_one("#quiz")
    for i, q in enumerate(quiz.select(".question"), 1):
        stem = q.select_one(".q-text, p, .stem")
        stem_text = re.sub(r"^\d+\.\s*", "", norm_ws((stem or q).get_text(" ", strip=True)))
        letters = []
        options = []
        for inp in q.select("input"):
            label = inp.find_parent("label") or inp.parent
            options.append((inp.get("value", ""), norm_ws(label.get_text(" ", strip=True))))
        answer = q.get("data-a")
        expl = norm_ws(q.get("data-e", ""))
        questions.append({
            "id": f"ad0-e605-practice-{i:03d}", "chapterId": None, "domainId": None,
            "topic": "Real-Time CDP Developer Expert", "difficulty": "professional", "type": "single",
            "question": stem_text,
            "options": [{"id": f"opt-{v.lower()}", "text": re.sub(r"^[A-Z]\.\s*", "", t)} for v, t in options],
            "correctAnswers": [f"opt-{answer.lower()}"] if answer else [],
            "explanation": expl, "incorrectExplanations": {},
            "explanationSource": "Complete_Study_Guide_AD0-E605.html (practice questions)",
        })
    chapters = []
    for s in sections(soup):
        if s["id"] in ("start", "quiz", "sources", "pitfalls", "plan", "labs", "exam"):
            continue
        title = h2(s)
        topics = [norm_ws(h.get_text(" ", strip=True)) for h in s.find_all("h3")]
        chapters.append({"id": s["id"], "title": title, "domain": title,
                         "overview": first_para(s), "topics": topics, "content": ""})
    domains = [{"name": c["title"], "keyTopics": c["topics"]} for c in chapters]
    exam = {"certificationId": "ad0-e605", "code": "AD0-E605",
            "name": "Adobe Real-Time CDP Developer Expert",
            "specifications": {"totalQuestions": len(questions)}, "domains": domains}
    return soup, exam, chapters, questions

# ---------------------------------------------------------------- review-only bank (RTCDP)
def build_bank():
    raw = (SRC / "Adobe_RTCDP_Master_Practice_Question_Bank.html").read_text(encoding="utf8")
    script = max((s.get_text() for s in BeautifulSoup(raw, "html.parser").find_all("script")), key=len)
    def array(name):
        i = script.index(f"const {name}=") + len(f"const {name}=")
        depth, j, instr, esc = 0, i, False, False
        while True:
            c = script[j]
            if instr:
                if esc: esc = False
                elif c == "\\": esc = True
                elif c == '"': instr = False
            else:
                if c == '"': instr = True
                elif c in "[{": depth += 1
                elif c in "]}":
                    depth -= 1
                    if depth == 0: break
            j += 1
        return json.loads(script[i:j + 1])
    qs = array("QUESTIONS")
    pages = array("PAGES")
    def key(t):
        return " ".join(re.sub(r"[^a-z0-9]+", " ", t.lower()).split())[:300]
    # A page is a duplicate only if almost every word on it already appears in the question list.
    tok = lambda t: re.findall(r"[a-z0-9]+", t.lower())
    qwords = {w for q in qs for w in tok(q["text"])}
    items = []
    for i, q in enumerate(qs, 1):
        items.append({"id": f"rtcdp-bank-{i:03d}", "source": q["source"], "ref": q["ref"], "text": norm_ws(q["text"])})
    extra = 0
    for p in pages:
        words = tok(p["text"])
        if not words:
            continue
        covered = sum(1 for w in words if w in qwords) / len(words)
        if covered < 0.97:
            extra += 1
            items.append({"id": f"rtcdp-bank-p{p['page']:02d}-{extra:02d}", "source": p["source"],
                          "ref": f"{p['source']} page {p['page']}", "text": norm_ws(p["text"])})
    return items, len(qs), extra

def main():
    soup_aj, ajo_exam, ajo_chapters, ajo_qs = build_ajo()
    soup_rt, rt_exam, rt_chapters, rt_qs = build_rtcdp()
    for cert, exam, chapters, questions, ext in [
        ("ad0-e606", ajo_exam, ajo_chapters, ajo_qs, None),
        ("ad0-e605", rt_exam, rt_chapters, rt_qs, None)]:
        d = ROOT / "data" / cert
        d.mkdir(parents=True, exist_ok=True)
        (d / "exam.json").write_text(json.dumps(exam, ensure_ascii=False, indent=2), encoding="utf8")
        (d / "chapters.json").write_text(json.dumps({"certificationId": cert, "chapters": chapters},
                                                    ensure_ascii=False, indent=2), encoding="utf8")
        (d / "questions.json").write_text(json.dumps({"certificationId": cert, "questions": questions},
                                                     ensure_ascii=False, indent=2), encoding="utf8")
    print("AD0-E606: guide ok, graded questions", len(ajo_qs), "| chapters", len(ajo_chapters))
    print("AD0-E605: guide ok, graded questions", len(rt_qs), "| chapters", len(rt_chapters))

if __name__ == "__main__":
    main()
