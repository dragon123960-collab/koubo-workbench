import argparse
import json
from pathlib import Path

from faster_whisper import WhisperModel


def chars_from_word(word):
    text = word.word.strip()
    chars = list(text)
    if not chars:
        return []
    start = float(word.start)
    end = float(word.end)
    step = max(0.01, (end - start) / len(chars))
    return [
        {
            "ch": ch,
            "t": round(start + index * step, 3),
            "e": round(start + (index + 1) * step, 3),
        }
        for index, ch in enumerate(chars)
    ]


def main():
    parser = argparse.ArgumentParser(description="Transcribe voice audio into Koubo Workbench character timing JSON.")
    parser.add_argument("audio", help="Audio or video file to transcribe.")
    parser.add_argument("-o", "--output", default="workbench-char-timing.json", help="Output JSON path.")
    parser.add_argument("--model", default="base", help="Whisper/faster-whisper model name or local model path.")
    parser.add_argument("--device", default="cpu", help="cpu or cuda.")
    parser.add_argument("--compute-type", default="int8", help="faster-whisper compute type, e.g. int8, float16.")
    parser.add_argument("--language", default="zh", help="Language code, default zh.")
    args = parser.parse_args()

    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
    segments, info = model.transcribe(
        args.audio,
        language=args.language,
        word_timestamps=True,
        vad_filter=True,
    )

    script = []
    for index, segment in enumerate(segments, start=1):
        chars = []
        for word in segment.words or []:
            chars.extend(chars_from_word(word))
        if not chars:
            text = segment.text.strip()
            span = max(0.1, float(segment.end) - float(segment.start))
            step = span / max(1, len(text))
            chars = [
                {
                    "ch": ch,
                    "t": round(float(segment.start) + char_index * step, 3),
                    "e": round(float(segment.start) + (char_index + 1) * step, 3),
                }
                for char_index, ch in enumerate(text)
            ]
        script.append(
            {
                "id": f"sent-{index}",
                "text": segment.text.strip(),
                "startSec": round(float(segment.start), 3),
                "endSec": round(float(segment.end), 3),
                "chars": chars,
            }
        )

    payload = {
        "meta": {
            "tool": "faster-whisper",
            "model": args.model,
            "language": info.language,
            "durationSec": round(float(info.duration), 3),
        },
        "script": script,
    }

    output = Path(args.output)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(output.resolve())


if __name__ == "__main__":
    main()
