#!/usr/bin/env python3
"""Builds data/<cert>/quick-revision.json: a short summary of each study part.

Each point is the first sentence of one section in the complete study guide, with a link
(anchor) back to that section. Run from the project root:

    python3 tools/build_quick_revision.py
"""
import json, pathlib, re
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parent.parent
GUIDES = {
    "ad0-e207": "Complete_Study_Guide_AD0-E207.html",
    "ad0-e408": "Complete_Study_Guide_AD0-E408.html",
    "ad0-e409": "Complete_Study_Guide_AD0-E409.html",
    "ad0-e607": "Complete_Study_Guide_AD0-E607.html",
}
MAX_POINT = 190

def clean(text):
    text = re.sub(r"\[[^\]]*\]", "", text)               # drop [Verified] / [VERIFY] tags
    text = re.sub(r"\s+", " ", text).strip()
    return text

def first_sentence(text):
    text = clean(text)
    m = re.match(r"(.+?[.!?])(\s|$)", text)
    sentence = m.group(1) if m else text
    if len(sentence) > MAX_POINT:
        sentence = sentence[:MAX_POINT].rsplit(" ", 1)[0].rstrip(",;:") + "…"
    return sentence

def section_text(h4):
    """Text of the paragraphs that belong to this heading (up to the next heading)."""
    out, node = [], h4.find_next_sibling()
    while node is not None and node.name not in ("h4", "h3", "h2", "section"):
        if node.name in ("p", "li"):
            out.append(node.get_text(" ", strip=True))
        elif node.name in ("ul", "ol", "div", "details"):
            for p in node.select("p, li"):
                out.append(p.get_text(" ", strip=True))
        node = node.find_next_sibling()
    return [t for t in out if len(t) > 30]

def build(cert, filename):
    soup = BeautifulSoup((ROOT / filename).read_text(encoding="utf8"), "html.parser")
    subject = soup.select_one("section.subject")
    parts_out = []
    for part in subject.select(":scope > section.part"):
        kind = part.select_one(".kind")
        if kind and kind.get_text(strip=True) == "Practice":
            continue
        title = clean(part.select_one("h3").get_text(" ", strip=True))
        points = []
        for h4 in part.select("h4[id]"):
            paras = [p for p in section_text(h4) if not clean(p).endswith(":")]
            if not paras:
                continue
            points.append({"text": first_sentence(paras[0]), "anchor": h4["id"]})
        if points:
            parts_out.append({"id": part["id"], "title": title, "points": points})
    data = {"certificationId": cert, "guide": filename, "parts": parts_out}
    out = ROOT / "data" / cert / "quick-revision.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf8")
    return out, len(parts_out), sum(len(p["points"]) for p in parts_out)

if __name__ == "__main__":
    for cert, filename in GUIDES.items():
        out, parts, points = build(cert, filename)
        print(f"{cert}: {parts} parts, {points} points -> {out.relative_to(ROOT)}")
