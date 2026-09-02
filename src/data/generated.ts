import type { ComponentDefinition, SfxAsset } from '../types';

export const componentDefinitions = [
  {
    "slug": "keyword-pop-highlight",
    "title": "关键词弹出强调",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "关键词弹出强调，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "关键词弹出强调",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "keyword-pop-highlight-cue-1",
        "componentId": "",
        "t": 0.55,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.5,
        "clip": 0.9,
        "note": "关键词弹出+镜头震"
      }
    ]
  },
  {
    "slug": "typewriter-reveal",
    "title": "打字机档案戳",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "打字机档案戳，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "打字机档案戳",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "typewriter-reveal-cue-1",
        "componentId": "",
        "t": 0.455,
        "assetId": "text-keyboard",
        "volume": 0.3,
        "clip": 0.8,
        "note": "打字第一段"
      },
      {
        "id": "typewriter-reveal-cue-2",
        "componentId": "",
        "t": 3.205,
        "assetId": "text-keyboard",
        "volume": 0.22,
        "rate": 1.05,
        "clip": 0.9,
        "note": "打字第二段"
      }
    ]
  },
  {
    "slug": "quote-card",
    "title": "金句大字卡",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "金句大字卡，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "金句大字卡",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "quote-card-cue-1",
        "componentId": "",
        "t": 0.35,
        "assetId": "ui-pop",
        "volume": 0.34,
        "rate": 1.06,
        "note": "行1"
      }
    ]
  },
  {
    "slug": "type-contrast-emphasis",
    "title": "字体对比重音",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "字体对比重音，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "字体对比重音",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "type-contrast-emphasis-cue-1",
        "componentId": "",
        "t": 1.17,
        "assetId": "ui-pop",
        "volume": 0.45,
        "rate": 0.92,
        "note": "重音流量"
      },
      {
        "id": "type-contrast-emphasis-cue-2",
        "componentId": "",
        "t": 1.67,
        "assetId": "ui-pop",
        "volume": 0.5,
        "note": "重音信任"
      }
    ]
  },
  {
    "slug": "soft-blur-in",
    "title": "柔焦淡入",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "柔焦淡入，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "柔焦淡入",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "soft-blur-in-cue-1",
        "componentId": "",
        "t": 0.28,
        "assetId": "riser-riser-cine",
        "volume": 0.34,
        "clip": 0.9,
        "note": "柔焦淡入"
      }
    ]
  },
  {
    "slug": "per-character-rise",
    "title": "逐字升起",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "逐字升起，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "逐字升起",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "per-character-rise-cue-1",
        "componentId": "",
        "t": 0.3,
        "assetId": "transition-transition-soft",
        "volume": 0.26,
        "note": "字1"
      }
    ]
  },
  {
    "slug": "line-by-line-slide",
    "title": "逐行滑入",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "逐行滑入，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "逐行滑入",
      "items": "项目目标\n开发规则\n验收标准",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "titleFontSize": 20,
      "itemFontSize": 20,
      "titleOffsetX": 0,
      "titleOffsetY": 0,
      "itemsOffsetX": 0,
      "itemsOffsetY": 0,
      "itemBackground": "transparent",
      "itemTextColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "line-by-line-slide-cue-1",
        "componentId": "",
        "t": 0.3,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.36,
        "note": "行1滑入"
      },
      {
        "id": "line-by-line-slide-cue-2",
        "componentId": "",
        "t": 0.433,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.36,
        "rate": 1.08,
        "note": "行2"
      },
      {
        "id": "line-by-line-slide-cue-3",
        "componentId": "",
        "t": 0.567,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.36,
        "rate": 1.16,
        "note": "行3"
      }
    ]
  },
  {
    "slug": "tracking-in",
    "title": "字距收拢",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "字距收拢，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "字距收拢",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "tracking-in-cue-1",
        "componentId": "",
        "t": 0.3,
        "assetId": "transition-transition-soft",
        "volume": 0.4,
        "rate": 1.05,
        "clip": 0.9,
        "note": "字距收拢"
      }
    ]
  },
  {
    "slug": "slab-punch-title",
    "title": "重点放大",
    "category": "字幕花字",
    "priority": "P0",
    "summary": "重点放大，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "重点放大",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "slab-punch-title-cue-1",
        "componentId": "",
        "t": 0.65,
        "assetId": "paper-paper-slice-quick",
        "volume": 0.4,
        "note": "红块中心展开"
      },
      {
        "id": "slab-punch-title-cue-2",
        "componentId": "",
        "t": 0.87,
        "assetId": "camera-camera-lens-shutter",
        "volume": 0.5,
        "clip": 0.9,
        "note": "白字硬切+punch"
      }
    ]
  },
  {
    "slug": "speed-slab-title",
    "title": "速度块标题",
    "category": "字幕花字",
    "priority": "P0",
    "summary": "速度块标题，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "速度块标题",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "speed-slab-title-cue-1",
        "componentId": "",
        "t": 0.66,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.45,
        "clip": 0.45,
        "note": "紫块飞入"
      }
    ]
  },
  {
    "slug": "impact-open-title",
    "title": "冲击开场",
    "category": "字幕花字",
    "priority": "P0",
    "summary": "冲击开场，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "冲击开场",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "impact-open-title-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "impact-impact-deep-whoosh",
        "volume": 0.6,
        "clip": 0.9,
        "note": "标题冲击入场"
      },
      {
        "id": "impact-open-title-cue-2",
        "componentId": "",
        "t": 0.7,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.4,
        "rate": 1.1,
        "clip": 0.9,
        "note": "重点变橙"
      }
    ]
  },
  {
    "slug": "alt-block-lines",
    "title": "双色块对句",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "双色块对句，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "双色块对句",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "alt-block-lines-cue-1",
        "componentId": "",
        "t": 0.66,
        "assetId": "camera-click-camera",
        "volume": 0.4,
        "note": "click"
      },
      {
        "id": "alt-block-lines-cue-2",
        "componentId": "",
        "t": 0.78,
        "assetId": "camera-click-camera",
        "volume": 0.36,
        "rate": 1.1,
        "note": "click"
      }
    ]
  },
  {
    "slug": "outline-box-title",
    "title": "描边框标题",
    "category": "字幕花字",
    "priority": "P0",
    "summary": "描边框标题，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "描边框标题",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "outline-box-title-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "text-marker-pen-line",
        "volume": 0.4,
        "clip": 0.45,
        "note": "描边框画出"
      },
      {
        "id": "outline-box-title-cue-2",
        "componentId": "",
        "t": 0.86,
        "assetId": "paper-paper-slice-quick",
        "volume": 0.36,
        "note": "紫块展开"
      }
    ]
  },
  {
    "slug": "count-badge-title",
    "title": "数字重音标题",
    "category": "字幕花字",
    "priority": "P0",
    "summary": "数字重音标题，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "数字重音标题",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "count-badge-title-cue-1",
        "componentId": "",
        "t": 0.63,
        "assetId": "ui-pop",
        "volume": 0.45,
        "clip": 0.9,
        "note": "数字落定变紫"
      }
    ]
  },
  {
    "slug": "quote-bracket-pull",
    "title": "引号夹句",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "引号夹句，来自 字幕花字 常用动效卡。",
    "defaultProps": {
      "title": "引号夹句",
      "text": "一句话，一个视觉重音",
      "accent": "#d9480f",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 900,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "quote-bracket-pull-cue-1",
        "componentId": "",
        "t": 0.35,
        "assetId": "mech-lock-quick",
        "volume": 0.34,
        "clip": 0.6,
        "note": "引号夹入"
      },
      {
        "id": "quote-bracket-pull-cue-2",
        "componentId": "",
        "t": 1.09,
        "assetId": "text-marker-pen-line",
        "volume": 0.42,
        "clip": 0.4,
        "note": "荧光笔扫过"
      }
    ]
  },
  {
    "slug": "static-text-block",
    "title": "静态文字块",
    "category": "字幕花字",
    "priority": "P1",
    "summary": "没有入场戏的常驻文字层，适合每页标题、说明、标签和类 PPT 的固定信息。",
    "defaultProps": {
      "title": "页面标题",
      "text": "这是一段常驻说明文字",
      "accent": "#2364aa",
      "textColor": "#111827",
      "background": "transparent",
      "fontSize": 20,
      "fontWeight": 800,
      "titleFontSize": 20,
      "textFontSize": 20,
      "titleFontWeight": 800,
      "textFontWeight": 500,
      "titleFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "textFontFamily": "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
      "titleColor": "#111827",
      "bodyColor": "#111827",
      "align": "left"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 300
    },
    "defaultSfxCues": []
  },
  {
    "slug": "highlighter-sweep",
    "title": "荧光笔高亮扫过",
    "category": "强调标注",
    "priority": "P1",
    "summary": "荧光笔高亮扫过，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "荧光笔高亮扫过",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "highlighter-sweep-cue-1",
        "componentId": "",
        "t": 0.7,
        "assetId": "text-marker-pen-line",
        "volume": 0.45,
        "clip": 0.6,
        "note": "荧光笔扫过"
      }
    ]
  },
  {
    "slug": "scribble-annotation",
    "title": "手绘圈注箭头",
    "category": "强调标注",
    "priority": "P1",
    "summary": "手绘圈注箭头，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "手绘圈注箭头",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "scribble-annotation-cue-1",
        "componentId": "",
        "t": 0.5,
        "assetId": "text-marker-pen-line",
        "volume": 0.45,
        "clip": 0.55,
        "note": "圈注1"
      },
      {
        "id": "scribble-annotation-cue-2",
        "componentId": "",
        "t": 1.6,
        "assetId": "text-marker-pen-line",
        "volume": 0.42,
        "rate": 1.12,
        "clip": 0.4,
        "note": "圈注2"
      },
      {
        "id": "scribble-annotation-cue-3",
        "componentId": "",
        "t": 2.55,
        "assetId": "text-marker-pen-line",
        "volume": 0.4,
        "rate": 0.92,
        "clip": 0.35,
        "note": "箭头"
      }
    ]
  },
  {
    "slug": "magnifier-detail",
    "title": "局部放大镜",
    "category": "强调标注",
    "priority": "P1",
    "summary": "局部放大镜，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "局部放大镜",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "magnifier-detail-cue-1",
        "componentId": "",
        "t": 0.45,
        "assetId": "camera-ui-zoom-in",
        "volume": 0.45,
        "note": "放大镜弹出飞出"
      },
      {
        "id": "magnifier-detail-cue-2",
        "componentId": "",
        "t": 0.7,
        "assetId": "text-marker-pen-line",
        "volume": 0.3,
        "clip": 0.35,
        "note": "引线描画"
      }
    ]
  },
  {
    "slug": "callout-line-label",
    "title": "引线标签",
    "category": "强调标注",
    "priority": "P1",
    "summary": "引线标签，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "引线标签",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "callout-line-label-cue-1",
        "componentId": "",
        "t": 0.6,
        "assetId": "light-sparkle-touch",
        "volume": 0.55,
        "note": "ping"
      },
      {
        "id": "callout-line-label-cue-2",
        "componentId": "",
        "t": 0.8,
        "assetId": "text-marker-pen-line",
        "volume": 0.45,
        "note": "pk:text-marker-pen-line"
      },
      {
        "id": "callout-line-label-cue-3",
        "componentId": "",
        "t": 1.2,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.45,
        "clip": 0.9,
        "note": "pk:impact-hit-fast-exciting"
      },
      {
        "id": "callout-line-label-cue-4",
        "componentId": "",
        "t": 1.4,
        "assetId": "light-sparkle-touch",
        "volume": 0.55,
        "rate": 1.12,
        "note": "ping"
      },
      {
        "id": "callout-line-label-cue-5",
        "componentId": "",
        "t": 1.6,
        "assetId": "text-marker-pen-line",
        "volume": 0.45,
        "rate": 1.1,
        "note": "pk:text-marker-pen-line"
      },
      {
        "id": "callout-line-label-cue-6",
        "componentId": "",
        "t": 2,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.45,
        "rate": 1.08,
        "clip": 0.9,
        "note": "pk:impact-hit-fast-exciting"
      }
    ]
  },
  {
    "slug": "focus-dim-spotlight",
    "title": "聚焦压暗切换",
    "category": "强调标注",
    "priority": "P1",
    "summary": "聚焦压暗切换，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "聚焦压暗切换",
      "items": "项目目标\n开发规则\n验收标准",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "titleFontSize": 20,
      "itemFontSize": 20,
      "titleOffsetX": 0,
      "titleOffsetY": 0,
      "itemsOffsetX": 0,
      "itemsOffsetY": 0,
      "itemBackground": "transparent",
      "itemTextColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "focus-dim-spotlight-cue-1",
        "componentId": "",
        "t": 0.45,
        "assetId": "light-sparkle-touch",
        "volume": 0.45,
        "note": "压暗+亮环"
      },
      {
        "id": "focus-dim-spotlight-cue-2",
        "componentId": "",
        "t": 2,
        "assetId": "ui-ui-click-tone",
        "volume": 0.3,
        "note": "焦点跳行2"
      },
      {
        "id": "focus-dim-spotlight-cue-3",
        "componentId": "",
        "t": 3.2,
        "assetId": "ui-ui-click-tone",
        "volume": 0.3,
        "rate": 1.06,
        "note": "跳行3"
      },
      {
        "id": "focus-dim-spotlight-cue-4",
        "componentId": "",
        "t": 4.4,
        "assetId": "ui-ui-click-tone",
        "volume": 0.3,
        "rate": 1.12,
        "note": "跳行4"
      },
      {
        "id": "focus-dim-spotlight-cue-5",
        "componentId": "",
        "t": 5.6,
        "assetId": "transition-air-whoosh-powerful",
        "volume": 0.34,
        "clip": 0.9,
        "note": "通道切换撑开"
      }
    ]
  },
  {
    "slug": "strike-and-replace",
    "title": "划掉替换",
    "category": "强调标注",
    "priority": "P1",
    "summary": "划掉替换，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "划掉替换",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "strike-and-replace-cue-1",
        "componentId": "",
        "t": 0.35,
        "assetId": "paper-paper-slice-quick",
        "volume": 0.5,
        "note": "红线划过"
      },
      {
        "id": "strike-and-replace-cue-2",
        "componentId": "",
        "t": 0.6,
        "assetId": "ui-pop",
        "volume": 0.44,
        "rate": 1.08,
        "note": "换成1M"
      }
    ]
  },
  {
    "slug": "ink-underline",
    "title": "墨迹下划线",
    "category": "强调标注",
    "priority": "P1",
    "summary": "墨迹下划线，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "墨迹下划线",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "ink-underline-cue-1",
        "componentId": "",
        "t": 0.55,
        "assetId": "text-marker-pen-line",
        "volume": 0.42,
        "clip": 0.5,
        "note": "墨迹划1"
      },
      {
        "id": "ink-underline-cue-2",
        "componentId": "",
        "t": 1.8,
        "assetId": "text-marker-pen-line",
        "volume": 0.4,
        "rate": 1.08,
        "clip": 0.45,
        "note": "墨迹划2"
      }
    ]
  },
  {
    "slug": "hand-drawn-ellipse",
    "title": "手绘椭圆圈",
    "category": "强调标注",
    "priority": "P1",
    "summary": "手绘椭圆圈，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "手绘椭圆圈",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "hand-drawn-ellipse-cue-1",
        "componentId": "",
        "t": 0.42,
        "assetId": "text-marker-pen-line",
        "volume": 0.45,
        "clip": 0.5,
        "note": "手绘圈画出"
      }
    ]
  },
  {
    "slug": "converging-arrows",
    "title": "汇聚箭头",
    "category": "强调标注",
    "priority": "P1",
    "summary": "汇聚箭头，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "汇聚箭头",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "converging-arrows-cue-1",
        "componentId": "",
        "t": 0.42,
        "assetId": "text-marker-pen-line",
        "volume": 0.4,
        "clip": 0.45,
        "note": "箭杆1"
      },
      {
        "id": "converging-arrows-cue-2",
        "componentId": "",
        "t": 0.48,
        "assetId": "text-marker-pen-line",
        "volume": 0.34,
        "rate": 1.12,
        "clip": 0.45,
        "note": "箭杆2"
      },
      {
        "id": "converging-arrows-cue-3",
        "componentId": "",
        "t": 0.85,
        "assetId": "ui-pop",
        "volume": 0.5,
        "note": "关键词变橙"
      }
    ]
  },
  {
    "slug": "corner-bracket-frame",
    "title": "对角角框",
    "category": "强调标注",
    "priority": "P1",
    "summary": "对角角框，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "对角角框",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "corner-bracket-frame-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "camera-ui-zoom-in",
        "volume": 0.34,
        "clip": 0.5,
        "note": "角框咬合"
      },
      {
        "id": "corner-bracket-frame-cue-2",
        "componentId": "",
        "t": 0.72,
        "assetId": "camera-camera-lens-shutter",
        "volume": 0.22,
        "rate": 1.08,
        "note": "行2淡入"
      }
    ]
  },
  {
    "slug": "quote-hold-arrow",
    "title": "金句停留",
    "category": "强调标注",
    "priority": "P1",
    "summary": "金句停留，来自 强调标注 常用动效卡。",
    "defaultProps": {
      "title": "金句停留",
      "text": "把注意力压到这一句",
      "accent": "#e24b3b",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 300
    },
    "defaultSfxCues": [
      {
        "id": "quote-hold-arrow-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "ui-pop",
        "volume": 0.24,
        "note": "行1"
      },
      {
        "id": "quote-hold-arrow-cue-2",
        "componentId": "",
        "t": 1.26,
        "assetId": "text-marker-pen-line",
        "volume": 0.42,
        "clip": 0.35,
        "note": "高亮框展开"
      }
    ]
  },
  {
    "slug": "number-counter",
    "title": "数字滚动计数",
    "category": "数据信息图",
    "priority": "P0",
    "summary": "数字滚动计数，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "数字滚动计数",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "number-counter-cue-1",
        "componentId": "",
        "t": 0.3,
        "assetId": "data-data-load-os",
        "volume": 0.34,
        "rate": 0.9,
        "clip": 2,
        "note": "计数"
      }
    ]
  },
  {
    "slug": "chart-grow",
    "title": "图表生长",
    "category": "数据信息图",
    "priority": "P0",
    "summary": "图表生长，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "图表生长",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "chart-grow-cue-1",
        "componentId": "",
        "t": 0.52,
        "assetId": "mech-lock-quick",
        "volume": 0.45,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "chart-grow-cue-2",
        "componentId": "",
        "t": 0.66,
        "assetId": "mech-lock-quick",
        "volume": 0.45,
        "rate": 1.08,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "chart-grow-cue-3",
        "componentId": "",
        "t": 0.8,
        "assetId": "mech-lock-quick",
        "volume": 0.5,
        "rate": 1.17,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "chart-grow-cue-4",
        "componentId": "",
        "t": 0.96,
        "assetId": "mech-lock-quick",
        "volume": 0.5,
        "rate": 1.26,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "chart-grow-cue-5",
        "componentId": "",
        "t": 1.14,
        "assetId": "mech-lock-quick",
        "volume": 0.6,
        "rate": 1.35,
        "note": "pk:mech-lock-quick"
      }
    ]
  },
  {
    "slug": "info-term-card",
    "title": "名词解释悬浮卡",
    "category": "数据信息图",
    "priority": "P1",
    "summary": "名词解释悬浮卡，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "名词解释悬浮卡",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "info-term-card-cue-1",
        "componentId": "",
        "t": 0.05,
        "assetId": "ui-pop",
        "volume": 0.45,
        "clip": 0.9,
        "note": "卡滑入"
      }
    ]
  },
  {
    "slug": "map-route-pin",
    "title": "地图路线图钉",
    "category": "数据信息图",
    "priority": "P1",
    "summary": "地图路线图钉，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "地图路线图钉",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "map-route-pin-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.45,
        "clip": 0.9,
        "note": "图钉1砸落"
      },
      {
        "id": "map-route-pin-cue-2",
        "componentId": "",
        "t": 0.85,
        "assetId": "text-marker-pen-line",
        "volume": 0.3,
        "clip": 1,
        "note": "航线1描画"
      },
      {
        "id": "map-route-pin-cue-3",
        "componentId": "",
        "t": 2.2,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.45,
        "rate": 1.06,
        "clip": 0.9,
        "note": "图钉2砸落"
      },
      {
        "id": "map-route-pin-cue-4",
        "componentId": "",
        "t": 2.95,
        "assetId": "text-marker-pen-line",
        "volume": 0.3,
        "rate": 1.05,
        "clip": 1,
        "note": "航线2描画"
      },
      {
        "id": "map-route-pin-cue-5",
        "componentId": "",
        "t": 4.3,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.5,
        "rate": 1.1,
        "clip": 0.9,
        "note": "图钉3砸落"
      }
    ]
  },
  {
    "slug": "line-chart-story-draw",
    "title": "折线分段推演",
    "category": "数据信息图",
    "priority": "P0",
    "summary": "折线分段推演，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "折线分段推演",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "line-chart-story-draw-cue-1",
        "componentId": "",
        "t": 0.6,
        "assetId": "ui-pop",
        "volume": 0.5,
        "note": "红点弹出"
      },
      {
        "id": "line-chart-story-draw-cue-2",
        "componentId": "",
        "t": 1.2,
        "assetId": "text-marker-pen-line",
        "volume": 0.38,
        "clip": 0.6,
        "note": "段1描画"
      },
      {
        "id": "line-chart-story-draw-cue-3",
        "componentId": "",
        "t": 1.8,
        "assetId": "light-sparkle-touch",
        "volume": 0.45,
        "note": "▲5%标签"
      },
      {
        "id": "line-chart-story-draw-cue-4",
        "componentId": "",
        "t": 2.15,
        "assetId": "text-marker-pen-line",
        "volume": 0.34,
        "rate": 1.06,
        "clip": 0.6,
        "note": "段2描画"
      },
      {
        "id": "line-chart-story-draw-cue-5",
        "componentId": "",
        "t": 3.15,
        "assetId": "text-marker-pen-line",
        "volume": 0.36,
        "rate": 0.94,
        "clip": 0.7,
        "note": "虚线推演"
      },
      {
        "id": "line-chart-story-draw-cue-6",
        "componentId": "",
        "t": 3.85,
        "assetId": "light-sparkle-touch",
        "volume": 0.45,
        "rate": 1.1,
        "note": "涨幅×2标签"
      }
    ]
  },
  {
    "slug": "ui-prop-theater",
    "title": "界面道具剧场",
    "category": "数据信息图",
    "priority": "P1",
    "summary": "界面道具剧场，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "界面道具剧场",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "ui-prop-theater-cue-1",
        "componentId": "",
        "t": 1.66,
        "assetId": "text-typewriter-hit-soft",
        "volume": 0.28,
        "clip": 0.4,
        "note": "清单1打勾"
      },
      {
        "id": "ui-prop-theater-cue-2",
        "componentId": "",
        "t": 2.51,
        "assetId": "text-typewriter-hit-soft",
        "volume": 0.28,
        "rate": 1.06,
        "clip": 0.4,
        "note": "清单2打勾"
      },
      {
        "id": "ui-prop-theater-cue-3",
        "componentId": "",
        "t": 4.71,
        "assetId": "ui-pop",
        "volume": 0.5,
        "note": "大对勾弹出"
      }
    ]
  },
  {
    "slug": "step-timeline-vertical",
    "title": "竖向步骤线",
    "category": "数据信息图",
    "priority": "P0",
    "summary": "竖向步骤线，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "竖向步骤线",
      "items": "项目目标\n开发规则\n验收标准",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "titleFontSize": 20,
      "itemFontSize": 20,
      "titleOffsetX": 0,
      "titleOffsetY": 0,
      "itemsOffsetX": 0,
      "itemsOffsetY": 0,
      "itemBackground": "transparent",
      "itemTextColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "step-timeline-vertical-cue-1",
        "componentId": "",
        "t": 0.52,
        "assetId": "mech-lock-quick",
        "volume": 0.34,
        "clip": 0.5,
        "note": "节点1"
      },
      {
        "id": "step-timeline-vertical-cue-2",
        "componentId": "",
        "t": 0.7,
        "assetId": "mech-lock-quick",
        "volume": 0.36,
        "rate": 1.08,
        "clip": 0.5,
        "note": "节点2"
      },
      {
        "id": "step-timeline-vertical-cue-3",
        "componentId": "",
        "t": 0.88,
        "assetId": "mech-lock-quick",
        "volume": 0.38,
        "rate": 1.16,
        "clip": 0.5,
        "note": "节点3"
      }
    ]
  },
  {
    "slug": "numbered-step-stack",
    "title": "编号步骤堆入",
    "category": "数据信息图",
    "priority": "P1",
    "summary": "编号步骤堆入，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "编号步骤堆入",
      "items": "项目目标\n开发规则\n验收标准",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "titleFontSize": 20,
      "itemFontSize": 20,
      "titleOffsetX": 0,
      "titleOffsetY": 0,
      "itemsOffsetX": 0,
      "itemsOffsetY": 0,
      "itemBackground": "transparent",
      "itemTextColor": "#111827"
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "numbered-step-stack-cue-1",
        "componentId": "",
        "t": 0.64,
        "assetId": "mech-lock-quick",
        "volume": 0.4,
        "note": "步骤1堆入"
      },
      {
        "id": "numbered-step-stack-cue-2",
        "componentId": "",
        "t": 0.75,
        "assetId": "mech-lock-quick",
        "volume": 0.4,
        "rate": 1.06,
        "note": "步骤2"
      },
      {
        "id": "numbered-step-stack-cue-3",
        "componentId": "",
        "t": 0.86,
        "assetId": "mech-lock-quick",
        "volume": 0.4,
        "rate": 1.12,
        "note": "步骤3"
      },
      {
        "id": "numbered-step-stack-cue-4",
        "componentId": "",
        "t": 0.97,
        "assetId": "mech-lock-quick",
        "volume": 0.44,
        "rate": 1.18,
        "note": "步骤4"
      }
    ]
  },
  {
    "slug": "metric-with-sparkline",
    "title": "数字带趋势",
    "category": "数据信息图",
    "priority": "P1",
    "summary": "数字带趋势，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "数字带趋势",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "metric-with-sparkline-cue-1",
        "componentId": "",
        "t": 0.5,
        "assetId": "scifi-scifi-click",
        "volume": 0.3,
        "rate": 0.9,
        "clip": 2.5,
        "note": "计数"
      }
    ]
  },
  {
    "slug": "bar-chart-growth",
    "title": "柱状增长",
    "category": "数据信息图",
    "priority": "P0",
    "summary": "柱状增长，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "柱状增长",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "bar-chart-growth-cue-1",
        "componentId": "",
        "t": 0.42,
        "assetId": "text-marker-pen-line",
        "volume": 0.32,
        "clip": 0.24,
        "note": "pk:text-marker-pen-line"
      },
      {
        "id": "bar-chart-growth-cue-2",
        "componentId": "",
        "t": 0.62,
        "assetId": "mech-lock-quick",
        "volume": 0.34,
        "rate": 0.92,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "bar-chart-growth-cue-3",
        "componentId": "",
        "t": 0.68,
        "assetId": "mech-lock-quick",
        "volume": 0.36,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "bar-chart-growth-cue-4",
        "componentId": "",
        "t": 0.74,
        "assetId": "mech-lock-quick",
        "volume": 0.38,
        "rate": 1.08,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "bar-chart-growth-cue-5",
        "componentId": "",
        "t": 0.8,
        "assetId": "mech-lock-quick",
        "volume": 0.4,
        "rate": 1.16,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "bar-chart-growth-cue-6",
        "componentId": "",
        "t": 0.86,
        "assetId": "mech-lock-quick",
        "volume": 0.42,
        "rate": 1.24,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "bar-chart-growth-cue-7",
        "componentId": "",
        "t": 0.92,
        "assetId": "mech-lock-quick",
        "volume": 0.44,
        "rate": 1.32,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "bar-chart-growth-cue-8",
        "componentId": "",
        "t": 0.98,
        "assetId": "mech-lock-quick",
        "volume": 0.48,
        "rate": 1.4,
        "note": "pk:mech-lock-quick"
      },
      {
        "id": "bar-chart-growth-cue-9",
        "componentId": "",
        "t": 1.26,
        "assetId": "ui-pop",
        "volume": 0.55,
        "clip": 0.2,
        "note": "pk:ui-pop"
      }
    ]
  },
  {
    "slug": "number-slab-pop",
    "title": "数字弹出",
    "category": "数据信息图",
    "priority": "P1",
    "summary": "数字弹出，来自 数据信息图 常用动效卡。",
    "defaultProps": {
      "title": "数字弹出",
      "text": "关键数据正在增长",
      "value": "67%",
      "accent": "#1f8a70",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 760,
      "h": 470
    },
    "defaultSfxCues": [
      {
        "id": "number-slab-pop-cue-1",
        "componentId": "",
        "t": 0.54,
        "assetId": "ui-pop",
        "volume": 0.55,
        "note": "数字弹出"
      }
    ]
  },
  {
    "slug": "ui-flow-theater",
    "title": "界面流程剧场",
    "category": "素材呈现",
    "priority": "P0",
    "summary": "界面流程剧场，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "界面流程剧场",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "ui-flow-theater-cue-1",
        "componentId": "",
        "t": 0.6,
        "assetId": "data-data-load-os",
        "volume": 0.24,
        "clip": 0.6,
        "note": "面板揭示"
      },
      {
        "id": "ui-flow-theater-cue-2",
        "componentId": "",
        "t": 2.1,
        "assetId": "mech-lock-quick",
        "volume": 0.5,
        "note": "点开关"
      },
      {
        "id": "ui-flow-theater-cue-3",
        "componentId": "",
        "t": 3.1,
        "assetId": "mech-lock-quick",
        "volume": 0.5,
        "rate": 1.06,
        "note": "点分段控件"
      },
      {
        "id": "ui-flow-theater-cue-4",
        "componentId": "",
        "t": 4.05,
        "assetId": "counter-clock-tick-single",
        "volume": 0.45,
        "rate": 0.94,
        "note": "按住滑块"
      },
      {
        "id": "ui-flow-theater-cue-5",
        "componentId": "",
        "t": 5.9,
        "assetId": "ui-ui-click-tone",
        "volume": 0.55,
        "rate": 0.96,
        "note": "点保存"
      },
      {
        "id": "ui-flow-theater-cue-6",
        "componentId": "",
        "t": 6.02,
        "assetId": "ui-pop",
        "volume": 0.45,
        "note": "成功对勾"
      }
    ]
  },
  {
    "slug": "media-pop-in",
    "title": "素材弹入堆叠",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "素材弹入堆叠，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "素材弹入堆叠",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "media-pop-in-cue-1",
        "componentId": "",
        "t": 0.45,
        "assetId": "ui-pop",
        "volume": 0.5,
        "note": "素材1"
      },
      {
        "id": "media-pop-in-cue-2",
        "componentId": "",
        "t": 0.6,
        "assetId": "ui-pop",
        "volume": 0.5,
        "rate": 1.1,
        "note": "素材2"
      },
      {
        "id": "media-pop-in-cue-3",
        "componentId": "",
        "t": 0.75,
        "assetId": "ui-pop",
        "volume": 0.5,
        "rate": 0.92,
        "note": "素材3"
      }
    ]
  },
  {
    "slug": "news-card-desk",
    "title": "新闻卡片划重点",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "新闻卡片划重点，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "新闻卡片划重点",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "news-card-desk-cue-1",
        "componentId": "",
        "t": 0.1,
        "assetId": "paper-paper-slide",
        "volume": 0.5,
        "clip": 0.9,
        "note": "卡A铺上"
      },
      {
        "id": "news-card-desk-cue-2",
        "componentId": "",
        "t": 1,
        "assetId": "text-marker-pen-line",
        "volume": 0.45,
        "clip": 0.4,
        "note": "划重点"
      },
      {
        "id": "news-card-desk-cue-3",
        "componentId": "",
        "t": 1.9,
        "assetId": "paper-paper-slide",
        "volume": 0.45,
        "rate": 1.1,
        "clip": 0.9,
        "note": "卡B滑入"
      }
    ]
  },
  {
    "slug": "pencil-sketch-draw",
    "title": "铅笔手绘揭示",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "铅笔手绘揭示，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "铅笔手绘揭示",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "pencil-sketch-draw-cue-1",
        "componentId": "",
        "t": 0.3,
        "assetId": "text-pencil-write-short",
        "volume": 0.45,
        "clip": 0.9,
        "note": "铅笔描1"
      },
      {
        "id": "pencil-sketch-draw-cue-2",
        "componentId": "",
        "t": 1.65,
        "assetId": "text-pencil-write-short",
        "volume": 0.45,
        "rate": 0.95,
        "clip": 0.9,
        "note": "铅笔描2"
      },
      {
        "id": "pencil-sketch-draw-cue-3",
        "componentId": "",
        "t": 3.2,
        "assetId": "text-pencil-write-short",
        "volume": 0.42,
        "rate": 1.08,
        "clip": 0.45,
        "note": "铅笔描3"
      }
    ]
  },
  {
    "slug": "cursor-actor-demo",
    "title": "光标演员演示",
    "category": "素材呈现",
    "priority": "P0",
    "summary": "光标演员演示，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "光标演员演示",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "cursor-actor-demo-cue-1",
        "componentId": "",
        "t": 1.19,
        "assetId": "ui-ui-click-tone",
        "volume": 0.5,
        "note": "点开关1"
      },
      {
        "id": "cursor-actor-demo-cue-2",
        "componentId": "",
        "t": 1.93,
        "assetId": "ui-ui-click-tone",
        "volume": 0.5,
        "rate": 1.06,
        "note": "点开关2"
      },
      {
        "id": "cursor-actor-demo-cue-3",
        "componentId": "",
        "t": 2.95,
        "assetId": "paper-paper-slide",
        "volume": 0.34,
        "note": "抓起缩略图"
      },
      {
        "id": "cursor-actor-demo-cue-4",
        "componentId": "",
        "t": 3.13,
        "assetId": "transition-transition-soft",
        "volume": 0.24,
        "clip": 0.6,
        "note": "拖移"
      },
      {
        "id": "cursor-actor-demo-cue-5",
        "componentId": "",
        "t": 3.75,
        "assetId": "ui-pop",
        "volume": 0.5,
        "note": "落入插槽"
      }
    ]
  },
  {
    "slug": "evidence-scroll-tour",
    "title": "证据长页慢滚",
    "category": "素材呈现",
    "priority": "P0",
    "summary": "证据长页慢滚，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "证据长页慢滚",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "evidence-scroll-tour-cue-1",
        "componentId": "",
        "t": 0.6,
        "assetId": "paper-paper-slide",
        "volume": 0.4,
        "clip": 0.9,
        "note": "长页起滚"
      },
      {
        "id": "evidence-scroll-tour-cue-2",
        "componentId": "",
        "t": 5.18,
        "assetId": "ui-pop",
        "volume": 0.38,
        "rate": 0.94,
        "note": "红框停定"
      },
      {
        "id": "evidence-scroll-tour-cue-3",
        "componentId": "",
        "t": 6.68,
        "assetId": "paper-paper-slide",
        "volume": 0.34,
        "rate": 1.08,
        "clip": 0.9,
        "note": "再起滚"
      }
    ]
  },
  {
    "slug": "motion-blur-slam-in",
    "title": "模糊甩入急停",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "模糊甩入急停，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "模糊甩入急停",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "motion-blur-slam-in-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.34,
        "clip": 0.5,
        "note": "卡A甩出"
      },
      {
        "id": "motion-blur-slam-in-cue-2",
        "componentId": "",
        "t": 0.6,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.5,
        "clip": 0.9,
        "note": "卡A急停"
      },
      {
        "id": "motion-blur-slam-in-cue-3",
        "componentId": "",
        "t": 0.8,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.3,
        "rate": 1.1,
        "clip": 0.5,
        "note": "卡B甩出"
      },
      {
        "id": "motion-blur-slam-in-cue-4",
        "componentId": "",
        "t": 1,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.45,
        "rate": 1.08,
        "clip": 0.9,
        "note": "卡B急停"
      }
    ]
  },
  {
    "slug": "terminal-typing-log",
    "title": "终端逐行推进",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "终端逐行推进，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "终端逐行推进",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "terminal-typing-log-cue-1",
        "componentId": "",
        "t": 0.32,
        "assetId": "text-keyboard",
        "volume": 0.32,
        "clip": 0.55,
        "note": "敲命令1"
      },
      {
        "id": "terminal-typing-log-cue-2",
        "componentId": "",
        "t": 1.042,
        "assetId": "data-data-load-os",
        "volume": 0.28,
        "rate": 1.2,
        "note": "输出流1"
      },
      {
        "id": "terminal-typing-log-cue-3",
        "componentId": "",
        "t": 3.635,
        "assetId": "text-keyboard",
        "volume": 0.32,
        "rate": 1.02,
        "clip": 0.5,
        "note": "敲命令2"
      },
      {
        "id": "terminal-typing-log-cue-4",
        "componentId": "",
        "t": 4.269,
        "assetId": "data-data-load-os",
        "volume": 0.28,
        "rate": 1.25,
        "note": "输出流2"
      }
    ]
  },
  {
    "slug": "chat-message-flow",
    "title": "聊天记录自演",
    "category": "素材呈现",
    "priority": "P0",
    "summary": "聊天记录自演，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "聊天记录自演",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "chat-message-flow-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "text-keyboard",
        "volume": 0.26,
        "clip": 1,
        "note": "pk:text-keyboard"
      },
      {
        "id": "chat-message-flow-cue-2",
        "componentId": "",
        "t": 1.87,
        "assetId": "ui-pop",
        "volume": 0.34,
        "rate": 1.06,
        "note": "pk:ui-pop"
      },
      {
        "id": "chat-message-flow-cue-3",
        "componentId": "",
        "t": 4.26,
        "assetId": "ui-pop",
        "volume": 0.5,
        "note": "pk:ui-pop"
      },
      {
        "id": "chat-message-flow-cue-4",
        "componentId": "",
        "t": 6.71,
        "assetId": "ui-pop",
        "volume": 0.5,
        "rate": 1.06,
        "note": "pk:ui-pop"
      },
      {
        "id": "chat-message-flow-cue-5",
        "componentId": "",
        "t": 7.45,
        "assetId": "ui-ui-click-tone",
        "volume": 0.45,
        "rate": 1.3,
        "note": "pk:ui-ui-click-tone"
      }
    ]
  },
  {
    "slug": "logo-enter",
    "title": "Logo 登场",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "Logo 登场，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "Logo 登场",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "logo-enter-cue-1",
        "componentId": "",
        "t": 0.35,
        "assetId": "mech-lock-quick",
        "volume": 0.55,
        "rate": 0.94,
        "note": "Logo弹入"
      }
    ]
  },
  {
    "slug": "chat-gpt",
    "title": "ChatGPT 对话框",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "ChatGPT 对话框，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "ChatGPT 对话框",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "chat-gpt-cue-1",
        "componentId": "",
        "t": 1.518,
        "assetId": "text-keyboard",
        "volume": 0.3,
        "clip": 1.2,
        "note": "pk:text-keyboard"
      },
      {
        "id": "chat-gpt-cue-2",
        "componentId": "",
        "t": 3.2,
        "assetId": "camera-click-camera",
        "volume": 0.34,
        "rate": 1.2,
        "note": "click"
      },
      {
        "id": "chat-gpt-cue-3",
        "componentId": "",
        "t": 4,
        "assetId": "data-data-load-os",
        "volume": 0.36,
        "rate": 1.28,
        "clip": 1.2,
        "note": "pk:data-data-load-os"
      }
    ]
  },
  {
    "slug": "claude-code",
    "title": "编码智能体终端",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "编码智能体终端，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "编码智能体终端",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "claude-code-cue-1",
        "componentId": "",
        "t": 1.691,
        "assetId": "text-keyboard",
        "volume": 0.32,
        "rate": 0.96,
        "clip": 2,
        "note": "pk:text-keyboard"
      },
      {
        "id": "claude-code-cue-2",
        "componentId": "",
        "t": 4.36,
        "assetId": "data-data-load-os",
        "volume": 0.3,
        "rate": 1.25,
        "clip": 2.5,
        "note": "pk:data-data-load-os"
      }
    ]
  },
  {
    "slug": "glass-code-walk",
    "title": "玻璃代码走读",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "玻璃代码走读，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "玻璃代码走读",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "glass-code-walk-cue-1",
        "componentId": "",
        "t": 0.06,
        "assetId": "mech-lock-quick",
        "volume": 0.34,
        "clip": 0.6,
        "note": "玻璃块弹入"
      },
      {
        "id": "glass-code-walk-cue-2",
        "componentId": "",
        "t": 1.4,
        "assetId": "camera-ui-zoom-in",
        "volume": 0.3,
        "clip": 0.5,
        "note": "推进阅读焦距"
      },
      {
        "id": "glass-code-walk-cue-3",
        "componentId": "",
        "t": 6.89,
        "assetId": "transition-air-whoosh-powerful",
        "volume": 0.26,
        "rate": 0.88,
        "clip": 0.9,
        "note": "拉回全貌"
      }
    ]
  },
  {
    "slug": "gooey-morph",
    "title": "图块拼入",
    "category": "素材呈现",
    "priority": "P1",
    "summary": "图块拼入，来自 素材呈现 常用动效卡。",
    "defaultProps": {
      "title": "图块拼入",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": [
      {
        "id": "gooey-morph-cue-1",
        "componentId": "",
        "t": 1,
        "assetId": "mech-lock-quick",
        "volume": 0.34,
        "clip": 0.45,
        "note": "图2咬到位（最先）"
      },
      {
        "id": "gooey-morph-cue-2",
        "componentId": "",
        "t": 1.133,
        "assetId": "mech-lock-quick",
        "volume": 0.34,
        "rate": 1.08,
        "clip": 0.45,
        "note": "图3咬到位"
      },
      {
        "id": "gooey-morph-cue-3",
        "componentId": "",
        "t": 1.267,
        "assetId": "mech-lock-quick",
        "volume": 0.36,
        "rate": 1.16,
        "clip": 0.45,
        "note": "图1咬到位"
      },
      {
        "id": "gooey-morph-cue-4",
        "componentId": "",
        "t": 1.433,
        "assetId": "mech-lock-quick",
        "volume": 0.4,
        "rate": 1.24,
        "clip": 0.45,
        "note": "图4咬到位（收尾）"
      }
    ]
  },
  {
    "slug": "chapter-title-card",
    "title": "章节标题卡",
    "category": "转场结构",
    "priority": "P0",
    "summary": "章节标题卡，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "章节标题卡",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "chapter-title-card-cue-1",
        "componentId": "",
        "t": 0.5,
        "assetId": "paper-paper-slide",
        "volume": 0.65,
        "clip": 0.34,
        "note": "pk:paper-paper-slide"
      },
      {
        "id": "chapter-title-card-cue-2",
        "componentId": "",
        "t": 2.75,
        "assetId": "paper-paper-slide",
        "volume": 0.55,
        "rate": 1.15,
        "clip": 0.9,
        "note": "pk:paper-paper-slide"
      },
      {
        "id": "chapter-title-card-cue-3",
        "componentId": "",
        "t": 3.75,
        "assetId": "paper-paper-slide",
        "volume": 0.65,
        "clip": 0.34,
        "note": "pk:paper-paper-slide"
      },
      {
        "id": "chapter-title-card-cue-4",
        "componentId": "",
        "t": 6,
        "assetId": "paper-paper-slide",
        "volume": 0.55,
        "rate": 1.15,
        "clip": 0.34,
        "note": "pk:paper-paper-slide"
      }
    ]
  },
  {
    "slug": "shape-wipe-transition",
    "title": "色块扫屏转场",
    "category": "转场结构",
    "priority": "P0",
    "summary": "色块扫屏转场，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "色块扫屏转场",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "shape-wipe-transition-cue-1",
        "componentId": "",
        "t": 0.9,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.42,
        "clip": 0.6,
        "note": "色块扫过"
      }
    ]
  },
  {
    "slug": "push-through-transition",
    "title": "推穿转场",
    "category": "转场结构",
    "priority": "P0",
    "summary": "推穿转场，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "推穿转场",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "push-through-transition-cue-1",
        "componentId": "",
        "t": 0.8,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.5,
        "clip": 0.55,
        "note": "加速推穿蓄势"
      }
    ]
  },
  {
    "slug": "overexpose-flip-transition",
    "title": "过曝翻页转场",
    "category": "转场结构",
    "priority": "P0",
    "summary": "过曝翻页转场，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "过曝翻页转场",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "overexpose-flip-transition-cue-1",
        "componentId": "",
        "t": 0.85,
        "assetId": "riser-riser-cine",
        "volume": 0.5,
        "clip": 0.4,
        "note": "过曝前蓄势"
      }
    ]
  },
  {
    "slug": "whip-pan-transition",
    "title": "横甩转场",
    "category": "转场结构",
    "priority": "P0",
    "summary": "横甩转场，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "横甩转场",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "whip-pan-transition-cue-1",
        "componentId": "",
        "t": 0.8,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.5,
        "clip": 0.9,
        "note": "横甩"
      }
    ]
  },
  {
    "slug": "black-slam-transition",
    "title": "黑震切转场",
    "category": "转场结构",
    "priority": "P0",
    "summary": "黑震切转场，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "黑震切转场",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "black-slam-transition-cue-1",
        "componentId": "",
        "t": 0.46,
        "assetId": "riser-riser-cine",
        "volume": 0.5,
        "clip": 0.46,
        "note": "riser"
      }
    ]
  },
  {
    "slug": "pullback-cool-transition",
    "title": "后拉冷却转场",
    "category": "转场结构",
    "priority": "P0",
    "summary": "后拉冷却转场，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "后拉冷却转场",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "pullback-cool-transition-cue-1",
        "componentId": "",
        "t": 1.25,
        "assetId": "camera-click-camera",
        "volume": 0.36,
        "clip": 1,
        "note": "长溶解后拉"
      }
    ]
  },
  {
    "slug": "particle-weld-transition",
    "title": "粒子溶接转场",
    "category": "转场结构",
    "priority": "P0",
    "summary": "粒子溶接转场，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "粒子溶接转场",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "particle-weld-transition-cue-1",
        "componentId": "",
        "t": 0.8,
        "assetId": "transition-sweep-scifi-fast",
        "volume": 0.34,
        "clip": 0.6,
        "note": "粒子炸开"
      }
    ]
  },
  {
    "slug": "long-take-world",
    "title": "长镜头世界画布",
    "category": "转场结构",
    "priority": "P1",
    "summary": "长镜头世界画布，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "长镜头世界画布",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "long-take-world-cue-1",
        "componentId": "",
        "t": 1.11,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.3,
        "rate": 0.9,
        "clip": 1.2,
        "note": "起飞去B"
      },
      {
        "id": "long-take-world-cue-2",
        "componentId": "",
        "t": 3.81,
        "assetId": "transition-wind-swoosh-short",
        "volume": 0.3,
        "rate": 0.85,
        "clip": 1.2,
        "note": "起飞去C"
      }
    ]
  },
  {
    "slug": "color-slam-beat-card",
    "title": "纯色硬切节拍卡",
    "category": "转场结构",
    "priority": "P1",
    "summary": "纯色硬切节拍卡，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "纯色硬切节拍卡",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "color-slam-beat-card-cue-1",
        "componentId": "",
        "t": 0.9,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.5,
        "clip": 0.9,
        "note": "硬切蓝"
      },
      {
        "id": "color-slam-beat-card-cue-2",
        "componentId": "",
        "t": 1.35,
        "assetId": "paper-paper-slide",
        "volume": 0.4,
        "clip": 0.9,
        "note": "素材卡升入"
      },
      {
        "id": "color-slam-beat-card-cue-3",
        "componentId": "",
        "t": 3.97,
        "assetId": "impact-hit-fast-exciting",
        "volume": 0.5,
        "rate": 1.08,
        "clip": 0.9,
        "note": "硬切红"
      },
      {
        "id": "color-slam-beat-card-cue-4",
        "componentId": "",
        "t": 4.42,
        "assetId": "paper-paper-slide",
        "volume": 0.4,
        "rate": 1.06,
        "clip": 0.9,
        "note": "素材卡升入"
      }
    ]
  },
  {
    "slug": "caret-wipe-transition",
    "title": "光标擦除转场",
    "category": "转场结构",
    "priority": "P0",
    "summary": "光标擦除转场，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "光标擦除转场",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": []
  },
  {
    "slug": "chapter-progress-list",
    "title": "章节进度",
    "category": "转场结构",
    "priority": "P1",
    "summary": "章节进度，来自 转场结构 常用动效卡。",
    "defaultProps": {
      "title": "章节进度",
      "text": "章节切换",
      "accent": "#111827",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1920,
      "h": 1080
    },
    "defaultSfxCues": [
      {
        "id": "chapter-progress-list-cue-1",
        "componentId": "",
        "t": 0.41,
        "assetId": "ui-ui-click-tone",
        "volume": 0.4,
        "note": "pk:ui-ui-click-tone"
      },
      {
        "id": "chapter-progress-list-cue-2",
        "componentId": "",
        "t": 0.51,
        "assetId": "ui-ui-click-tone",
        "volume": 0.4,
        "rate": 1.06,
        "note": "pk:ui-ui-click-tone"
      },
      {
        "id": "chapter-progress-list-cue-3",
        "componentId": "",
        "t": 0.61,
        "assetId": "ui-ui-click-tone",
        "volume": 0.4,
        "rate": 1.12,
        "note": "pk:ui-ui-click-tone"
      },
      {
        "id": "chapter-progress-list-cue-4",
        "componentId": "",
        "t": 0.71,
        "assetId": "ui-ui-click-tone",
        "volume": 0.4,
        "rate": 1.18,
        "note": "pk:ui-ui-click-tone"
      }
    ]
  },
  {
    "slug": "lower-third-nameplate",
    "title": "人名条展示牌",
    "category": "人物互动",
    "priority": "P1",
    "summary": "人名条展示牌，来自 人物互动 常用动效卡。",
    "defaultProps": {
      "title": "人名条展示牌",
      "text": "讲者让位，信息上台",
      "accent": "#8f5bff",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 260
    },
    "defaultSfxCues": [
      {
        "id": "lower-third-nameplate-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "scifi-scifi-click",
        "volume": 0.2,
        "clip": 0.9,
        "note": "墨条扫开"
      }
    ]
  },
  {
    "slug": "behind-text-title",
    "title": "人后大字视差",
    "category": "人物互动",
    "priority": "P0",
    "summary": "人后大字视差，来自 人物互动 常用动效卡。",
    "defaultProps": {
      "title": "人后大字视差",
      "text": "讲者让位，信息上台",
      "accent": "#8f5bff",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 260
    },
    "defaultSfxCues": [
      {
        "id": "behind-text-title-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "impact-impact-deep-whoosh",
        "volume": 0.6,
        "clip": 0.9,
        "note": "pk:impact-impact-deep-whoosh"
      }
    ]
  },
  {
    "slug": "subscribe-cta",
    "title": "多平台关注 CTA",
    "category": "人物互动",
    "priority": "P1",
    "summary": "多平台关注 CTA，来自 人物互动 常用动效卡。",
    "defaultProps": {
      "title": "多平台关注 CTA",
      "text": "讲者让位，信息上台",
      "accent": "#8f5bff",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 260
    },
    "defaultSfxCues": [
      {
        "id": "subscribe-cta-cue-1",
        "componentId": "",
        "t": 1.4,
        "assetId": "ui-ui-click-tone",
        "volume": 0.5,
        "note": "点订阅"
      },
      {
        "id": "subscribe-cta-cue-2",
        "componentId": "",
        "t": 4.75,
        "assetId": "ui-ui-click-tone",
        "volume": 0.45,
        "rate": 0.94,
        "note": "长按点赞"
      },
      {
        "id": "subscribe-cta-cue-3",
        "componentId": "",
        "t": 4.8,
        "assetId": "data-data-load-os",
        "volume": 0.3,
        "rate": 1.3,
        "clip": 0.55,
        "note": "进度环走满"
      },
      {
        "id": "subscribe-cta-cue-4",
        "componentId": "",
        "t": 5.35,
        "assetId": "ui-pop",
        "volume": 0.45,
        "note": "三连点亮1"
      },
      {
        "id": "subscribe-cta-cue-5",
        "componentId": "",
        "t": 5.55,
        "assetId": "ui-pop",
        "volume": 0.45,
        "rate": 1.1,
        "note": "点亮2"
      },
      {
        "id": "subscribe-cta-cue-6",
        "componentId": "",
        "t": 5.75,
        "assetId": "ui-pop",
        "volume": 0.5,
        "rate": 1.2,
        "note": "点亮3"
      },
      {
        "id": "subscribe-cta-cue-7",
        "componentId": "",
        "t": 8.4,
        "assetId": "ui-ui-click-tone",
        "volume": 0.5,
        "rate": 1.05,
        "note": "点关注"
      }
    ]
  },
  {
    "slug": "host-shrink-to-chip",
    "title": "人物缩位让台",
    "category": "人物互动",
    "priority": "P1",
    "summary": "人物缩位让台，来自 人物互动 常用动效卡。",
    "defaultProps": {
      "title": "人物缩位让台",
      "text": "讲者让位，信息上台",
      "accent": "#8f5bff",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 260
    },
    "defaultSfxCues": [
      {
        "id": "host-shrink-to-chip-cue-1",
        "componentId": "",
        "t": 0.8,
        "assetId": "camera-ui-zoom-in",
        "volume": 0.4,
        "note": "人物缩位"
      },
      {
        "id": "host-shrink-to-chip-cue-2",
        "componentId": "",
        "t": 0.95,
        "assetId": "paper-paper-slide",
        "volume": 0.42,
        "clip": 0.9,
        "note": "图形卡滑入"
      }
    ]
  },
  {
    "slug": "x-follow-card",
    "title": "关注卡弹出",
    "category": "人物互动",
    "priority": "P1",
    "summary": "关注卡弹出，来自 人物互动 常用动效卡。",
    "defaultProps": {
      "title": "关注卡弹出",
      "text": "讲者让位，信息上台",
      "accent": "#8f5bff",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 260
    },
    "defaultSfxCues": [
      {
        "id": "x-follow-card-cue-1",
        "componentId": "",
        "t": 0.05,
        "assetId": "ui-pop",
        "volume": 0.5,
        "rate": 0.94,
        "note": "卡弹入"
      },
      {
        "id": "x-follow-card-cue-2",
        "componentId": "",
        "t": 2.68,
        "assetId": "mech-lock-quick",
        "volume": 0.3,
        "clip": 0.4,
        "note": "粉丝数滚动"
      }
    ]
  },
  {
    "slug": "chevron-lower-third",
    "title": "动态人名条",
    "category": "人物互动",
    "priority": "P1",
    "summary": "动态人名条，来自 人物互动 常用动效卡。",
    "defaultProps": {
      "title": "动态人名条",
      "text": "讲者让位，信息上台",
      "accent": "#8f5bff",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 260
    },
    "defaultSfxCues": [
      {
        "id": "chevron-lower-third-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "scifi-scifi-click",
        "volume": 0.2,
        "clip": 0.9,
        "note": "pk:scifi-scifi-click"
      }
    ]
  },
  {
    "slug": "danmu-bubble-praise",
    "title": "弹幕气泡",
    "category": "人物互动",
    "priority": "P1",
    "summary": "弹幕气泡，来自 人物互动 常用动效卡。",
    "defaultProps": {
      "title": "弹幕气泡",
      "text": "讲者让位，信息上台",
      "accent": "#8f5bff",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 680,
      "h": 260
    },
    "defaultSfxCues": [
      {
        "id": "danmu-bubble-praise-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "ui-pop",
        "volume": 0.42,
        "note": "弹幕1"
      },
      {
        "id": "danmu-bubble-praise-cue-2",
        "componentId": "",
        "t": 0.95,
        "assetId": "ui-pop",
        "volume": 0.55,
        "rate": 1.14,
        "note": "弹幕2"
      },
      {
        "id": "danmu-bubble-praise-cue-3",
        "componentId": "",
        "t": 1.5,
        "assetId": "ui-pop",
        "volume": 0.42,
        "rate": 0.92,
        "note": "弹幕3"
      },
      {
        "id": "danmu-bubble-praise-cue-4",
        "componentId": "",
        "t": 2.05,
        "assetId": "ui-pop",
        "volume": 0.42,
        "rate": 1.06,
        "note": "弹幕4"
      }
    ]
  },
  {
    "slug": "slow-push-in",
    "title": "缓推特写",
    "category": "运镜",
    "priority": "P1",
    "summary": "缓推特写，来自 运镜 常用动效卡。",
    "defaultProps": {
      "title": "缓推特写",
      "text": "静态素材也要有镜头呼吸",
      "accent": "#0f766e",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1120,
      "h": 640
    },
    "defaultSfxCues": []
  },
  {
    "slug": "slow-pull-reveal",
    "title": "缓拉全貌",
    "category": "运镜",
    "priority": "P1",
    "summary": "缓拉全貌，来自 运镜 常用动效卡。",
    "defaultProps": {
      "title": "缓拉全貌",
      "text": "静态素材也要有镜头呼吸",
      "accent": "#0f766e",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1120,
      "h": 640
    },
    "defaultSfxCues": []
  },
  {
    "slug": "tilt-3d-page",
    "title": "3D 立面展示",
    "category": "运镜",
    "priority": "P1",
    "summary": "3D 立面展示，来自 运镜 常用动效卡。",
    "defaultProps": {
      "title": "3D 立面展示",
      "text": "静态素材也要有镜头呼吸",
      "accent": "#0f766e",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1120,
      "h": 640
    },
    "defaultSfxCues": []
  },
  {
    "slug": "sway-parallax",
    "title": "左右摇移",
    "category": "运镜",
    "priority": "P1",
    "summary": "左右摇移，来自 运镜 常用动效卡。",
    "defaultProps": {
      "title": "左右摇移",
      "text": "静态素材也要有镜头呼吸",
      "accent": "#0f766e",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1120,
      "h": 640
    },
    "defaultSfxCues": []
  },
  {
    "slug": "orbit-drift",
    "title": "环绕微漂",
    "category": "运镜",
    "priority": "P1",
    "summary": "环绕微漂，来自 运镜 常用动效卡。",
    "defaultProps": {
      "title": "环绕微漂",
      "text": "静态素材也要有镜头呼吸",
      "accent": "#0f766e",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1120,
      "h": 640
    },
    "defaultSfxCues": []
  },
  {
    "slug": "stage-keyframe-tour",
    "title": "长页兴趣点巡游",
    "category": "运镜",
    "priority": "P1",
    "summary": "长页兴趣点巡游，来自 运镜 常用动效卡。",
    "defaultProps": {
      "title": "长页兴趣点巡游",
      "text": "静态素材也要有镜头呼吸",
      "accent": "#0f766e",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1120,
      "h": 640
    },
    "defaultSfxCues": [
      {
        "id": "stage-keyframe-tour-cue-1",
        "componentId": "",
        "t": 0.9,
        "assetId": "counter-clock-tick-single",
        "volume": 0.4,
        "rate": 1.05,
        "clip": 1,
        "note": "推进Hero"
      },
      {
        "id": "stage-keyframe-tour-cue-2",
        "componentId": "",
        "t": 2.8,
        "assetId": "counter-clock-tick-single",
        "volume": 0.4,
        "clip": 1.1,
        "note": "飞到数据带"
      },
      {
        "id": "stage-keyframe-tour-cue-3",
        "componentId": "",
        "t": 4.9,
        "assetId": "counter-clock-tick-single",
        "volume": 0.4,
        "rate": 0.95,
        "clip": 1.15,
        "note": "飞到价格卡"
      }
    ]
  },
  {
    "slug": "cursor-locked-zoom",
    "title": "光标锁定跟拍",
    "category": "运镜",
    "priority": "P0",
    "summary": "光标锁定跟拍，来自 运镜 常用动效卡。",
    "defaultProps": {
      "title": "光标锁定跟拍",
      "text": "静态素材也要有镜头呼吸",
      "accent": "#0f766e",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1120,
      "h": 640
    },
    "defaultSfxCues": [
      {
        "id": "cursor-locked-zoom-cue-1",
        "componentId": "",
        "t": 0.45,
        "assetId": "text-keyboard",
        "volume": 0.3,
        "rate": 0.98,
        "clip": 3.3,
        "note": "打字全段"
      },
      {
        "id": "cursor-locked-zoom-cue-2",
        "componentId": "",
        "t": 4.6,
        "assetId": "transition-air-whoosh-powerful",
        "volume": 0.26,
        "rate": 0.9,
        "clip": 0.8,
        "note": "镜头拉回"
      }
    ]
  },
  {
    "slug": "pip-zoom-box",
    "title": "画中画放大",
    "category": "运镜",
    "priority": "P1",
    "summary": "画中画放大，来自 运镜 常用动效卡。",
    "defaultProps": {
      "title": "画中画放大",
      "text": "静态素材也要有镜头呼吸",
      "accent": "#0f766e",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 1120,
      "h": 640
    },
    "defaultSfxCues": [
      {
        "id": "pip-zoom-box-cue-1",
        "componentId": "",
        "t": 0.4,
        "assetId": "camera-click-camera",
        "volume": 0.4,
        "note": "取景框弹上脸"
      },
      {
        "id": "pip-zoom-box-cue-2",
        "componentId": "",
        "t": 0.75,
        "assetId": "camera-ui-zoom-in",
        "volume": 0.4,
        "clip": 0.55,
        "note": "推拉放大"
      },
      {
        "id": "pip-zoom-box-cue-3",
        "componentId": "",
        "t": 1.25,
        "assetId": "mech-lock-quick",
        "volume": 0.38,
        "clip": 0.5,
        "note": "停靠锁定"
      }
    ]
  },
  {
    "slug": "timeline-travel",
    "title": "时间轴横移",
    "category": "产品镜头",
    "priority": "P0",
    "summary": "沿横向刻度轴加速旅行，卡片随里程碑弹立，急停推近今天。",
    "defaultProps": {
      "title": "时间轴横移",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": []
  },
  {
    "slug": "canvas-materialize-moves",
    "title": "内容物化上画布",
    "category": "产品镜头",
    "priority": "P1",
    "summary": "面板行飞出变成画布卡，或 prompt 级联长出结构图。",
    "defaultProps": {
      "title": "内容物化上画布",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": []
  },
  {
    "slug": "page-waterfall-wall",
    "title": "页面瀑布墙",
    "category": "产品镜头",
    "priority": "P1",
    "summary": "多张真实页面形成瀑布墙，适合展示产品规模和页面族群。",
    "defaultProps": {
      "title": "页面瀑布墙",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": []
  },
  {
    "slug": "deck-deal-flyin",
    "title": "卡组发牌飞入",
    "category": "产品镜头",
    "priority": "P1",
    "summary": "一组卡片像发牌一样飞入叠放，适合批量证据和功能点。",
    "defaultProps": {
      "title": "卡组发牌飞入",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": []
  },
  {
    "slug": "row-embed",
    "title": "行嵌入展开",
    "category": "产品镜头",
    "priority": "P1",
    "summary": "列表行被点亮并展开成嵌入详情，适合产品流程解释。",
    "defaultProps": {
      "title": "行嵌入展开",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": []
  },
  {
    "slug": "spotlight-hero-card",
    "title": "聚光主角卡",
    "category": "产品镜头",
    "priority": "P0",
    "summary": "单个主角卡被聚光推近，适合片头或关键功能强调。",
    "defaultProps": {
      "title": "聚光主角卡",
      "text": "真实素材 / 页面截图",
      "accent": "#2364aa",
      "background": "transparent",
      "textColor": "#111827",
      "fontSize": 20
    },
    "defaultTiming": {
      "enter": 0.45,
      "hold": 2.7,
      "exit": 0.32
    },
    "defaultSize": {
      "w": 820,
      "h": 520
    },
    "defaultSfxCues": []
  }
] as ComponentDefinition[];

export const sfxAssets = [
  {
    "id": "camera-camera-autofocus",
    "category": "camera",
    "name": "camera-autofocus",
    "path": "/sfx/camera/camera-autofocus.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-camera-lens-shutter",
    "category": "camera",
    "name": "camera-lens-shutter",
    "path": "/sfx/camera/camera-lens-shutter.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-camera-shutter-hard",
    "category": "camera",
    "name": "camera-shutter-hard",
    "path": "/sfx/camera/camera-shutter-hard.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-camera-shutter-vintage",
    "category": "camera",
    "name": "camera-shutter-vintage",
    "path": "/sfx/camera/camera-shutter-vintage.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-click-camera",
    "category": "camera",
    "name": "click-camera",
    "path": "/sfx/camera/click-camera.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-ui-zoom-in",
    "category": "camera",
    "name": "ui-zoom-in",
    "path": "/sfx/camera/ui-zoom-in.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-ui-zoom-out",
    "category": "camera",
    "name": "ui-zoom-out",
    "path": "/sfx/camera/ui-zoom-out.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-zoom-air-fast",
    "category": "camera",
    "name": "zoom-air-fast",
    "path": "/sfx/camera/zoom-air-fast.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-zoom-futuristic",
    "category": "camera",
    "name": "zoom-futuristic",
    "path": "/sfx/camera/zoom-futuristic.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "camera-zoom-swipe-fast",
    "category": "camera",
    "name": "zoom-swipe-fast",
    "path": "/sfx/camera/zoom-swipe-fast.mp3",
    "recommendedUse": "镜头推进、快门、对焦"
  },
  {
    "id": "counter-clock-knob-spin",
    "category": "counter",
    "name": "clock-knob-spin",
    "path": "/sfx/counter/clock-knob-spin.mp3",
    "recommendedUse": "counter 材质拟音"
  },
  {
    "id": "counter-clock-mech-retract",
    "category": "counter",
    "name": "clock-mech-retract",
    "path": "/sfx/counter/clock-mech-retract.mp3",
    "recommendedUse": "counter 材质拟音"
  },
  {
    "id": "counter-clock-tick-single",
    "category": "counter",
    "name": "clock-tick-single",
    "path": "/sfx/counter/clock-tick-single.mp3",
    "recommendedUse": "counter 材质拟音"
  },
  {
    "id": "counter-countdown-bleeps",
    "category": "counter",
    "name": "countdown-bleeps",
    "path": "/sfx/counter/countdown-bleeps.mp3",
    "recommendedUse": "counter 材质拟音"
  },
  {
    "id": "crowd-applause-rhythmic-loop",
    "category": "crowd",
    "name": "applause-rhythmic-loop",
    "path": "/sfx/crowd/applause-rhythmic-loop.mp3",
    "recommendedUse": "crowd 材质拟音"
  },
  {
    "id": "crowd-clap-single",
    "category": "crowd",
    "name": "clap-single",
    "path": "/sfx/crowd/clap-single.mp3",
    "recommendedUse": "crowd 材质拟音"
  },
  {
    "id": "crowd-heartbeat-single",
    "category": "crowd",
    "name": "heartbeat-single",
    "path": "/sfx/crowd/heartbeat-single.mp3",
    "recommendedUse": "crowd 材质拟音"
  },
  {
    "id": "data-break-glitch-digital",
    "category": "data",
    "name": "break-glitch-digital",
    "path": "/sfx/data/break-glitch-digital.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-data-compute",
    "category": "data",
    "name": "data-compute",
    "path": "/sfx/data/data-compute.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-data-load-os",
    "category": "data",
    "name": "data-load-os",
    "path": "/sfx/data/data-load-os.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-data-scan",
    "category": "data",
    "name": "data-scan",
    "path": "/sfx/data/data-scan.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-glitch-electric-small",
    "category": "data",
    "name": "glitch-electric-small",
    "path": "/sfx/data/glitch-electric-small.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-glitch-static",
    "category": "data",
    "name": "glitch-static",
    "path": "/sfx/data/glitch-static.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-glitch-static-electric",
    "category": "data",
    "name": "glitch-static-electric",
    "path": "/sfx/data/glitch-static-electric.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-glitch-virtual-quick",
    "category": "data",
    "name": "glitch-virtual-quick",
    "path": "/sfx/data/glitch-virtual-quick.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-power-up-electronic",
    "category": "data",
    "name": "power-up-electronic",
    "path": "/sfx/data/power-up-electronic.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-power-up-static",
    "category": "data",
    "name": "power-up-static",
    "path": "/sfx/data/power-up-static.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-static-electric-present",
    "category": "data",
    "name": "static-electric-present",
    "path": "/sfx/data/static-electric-present.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-sweep-digital",
    "category": "data",
    "name": "sweep-digital",
    "path": "/sfx/data/sweep-digital.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "data-whoosh-electric",
    "category": "data",
    "name": "whoosh-electric",
    "path": "/sfx/data/whoosh-electric.mp3",
    "recommendedUse": "数据加载、扫描、流式输出"
  },
  {
    "id": "film-cassette-stretch",
    "category": "film",
    "name": "cassette-stretch",
    "path": "/sfx/film/cassette-stretch.mp3",
    "recommendedUse": "film 材质拟音"
  },
  {
    "id": "film-cassette-working",
    "category": "film",
    "name": "cassette-working",
    "path": "/sfx/film/cassette-working.mp3",
    "recommendedUse": "film 材质拟音"
  },
  {
    "id": "film-projector-spin-antique",
    "category": "film",
    "name": "projector-spin-antique",
    "path": "/sfx/film/projector-spin-antique.mp3",
    "recommendedUse": "film 材质拟音"
  },
  {
    "id": "film-reel-rewind",
    "category": "film",
    "name": "reel-rewind",
    "path": "/sfx/film/reel-rewind.mp3",
    "recommendedUse": "film 材质拟音"
  },
  {
    "id": "film-tape-rewind-cine",
    "category": "film",
    "name": "tape-rewind-cine",
    "path": "/sfx/film/tape-rewind-cine.mp3",
    "recommendedUse": "film 材质拟音"
  },
  {
    "id": "film-tape-rewind-fast",
    "category": "film",
    "name": "tape-rewind-fast",
    "path": "/sfx/film/tape-rewind-fast.mp3",
    "recommendedUse": "film 材质拟音"
  },
  {
    "id": "film-vinyl-needle-drop",
    "category": "film",
    "name": "vinyl-needle-drop",
    "path": "/sfx/film/vinyl-needle-drop.mp3",
    "recommendedUse": "film 材质拟音"
  },
  {
    "id": "film-vinyl-scratch-small",
    "category": "film",
    "name": "vinyl-scratch-small",
    "path": "/sfx/film/vinyl-scratch-small.mp3",
    "recommendedUse": "film 材质拟音"
  },
  {
    "id": "fluid-liquid-bubble",
    "category": "fluid",
    "name": "liquid-bubble",
    "path": "/sfx/fluid/liquid-bubble.mp3",
    "recommendedUse": "fluid 材质拟音"
  },
  {
    "id": "fluid-sand-swish",
    "category": "fluid",
    "name": "sand-swish",
    "path": "/sfx/fluid/sand-swish.mp3",
    "recommendedUse": "fluid 材质拟音"
  },
  {
    "id": "fluid-water-bubble",
    "category": "fluid",
    "name": "water-bubble",
    "path": "/sfx/fluid/water-bubble.mp3",
    "recommendedUse": "fluid 材质拟音"
  },
  {
    "id": "fluid-water-drop-cave",
    "category": "fluid",
    "name": "water-drop-cave",
    "path": "/sfx/fluid/water-drop-cave.mp3",
    "recommendedUse": "fluid 材质拟音"
  },
  {
    "id": "fluid-water-splash",
    "category": "fluid",
    "name": "water-splash",
    "path": "/sfx/fluid/water-splash.mp3",
    "recommendedUse": "fluid 材质拟音"
  },
  {
    "id": "glass-glass-break-hammer",
    "category": "glass",
    "name": "glass-break-hammer",
    "path": "/sfx/glass/glass-break-hammer.mp3",
    "recommendedUse": "glass 材质拟音"
  },
  {
    "id": "glass-glass-debris-sweep",
    "category": "glass",
    "name": "glass-debris-sweep",
    "path": "/sfx/glass/glass-debris-sweep.mp3",
    "recommendedUse": "glass 材质拟音"
  },
  {
    "id": "glass-glass-hit-cine",
    "category": "glass",
    "name": "glass-hit-cine",
    "path": "/sfx/glass/glass-hit-cine.mp3",
    "recommendedUse": "glass 材质拟音"
  },
  {
    "id": "glass-glass-plate-slide",
    "category": "glass",
    "name": "glass-plate-slide",
    "path": "/sfx/glass/glass-plate-slide.mp3",
    "recommendedUse": "glass 材质拟音"
  },
  {
    "id": "impact-bass-hit-futuristic",
    "category": "impact",
    "name": "bass-hit-futuristic",
    "path": "/sfx/impact/bass-hit-futuristic.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-bass-hit-short",
    "category": "impact",
    "name": "bass-hit-short",
    "path": "/sfx/impact/bass-hit-short.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-gravel-fall-hit",
    "category": "impact",
    "name": "gravel-fall-hit",
    "path": "/sfx/impact/gravel-fall-hit.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-hit-blow",
    "category": "impact",
    "name": "hit-blow",
    "path": "/sfx/impact/hit-blow.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-hit-fast-exciting",
    "category": "impact",
    "name": "hit-fast-exciting",
    "path": "/sfx/impact/hit-fast-exciting.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-hit-weak",
    "category": "impact",
    "name": "hit-weak",
    "path": "/sfx/impact/hit-weak.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-impact-cine-big",
    "category": "impact",
    "name": "impact-cine-big",
    "path": "/sfx/impact/impact-cine-big.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-impact-deep-whoosh",
    "category": "impact",
    "name": "impact-deep-whoosh",
    "path": "/sfx/impact/impact-deep-whoosh.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-impact-epic-trailer",
    "category": "impact",
    "name": "impact-epic-trailer",
    "path": "/sfx/impact/impact-epic-trailer.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-impact-movie-epic",
    "category": "impact",
    "name": "impact-movie-epic",
    "path": "/sfx/impact/impact-movie-epic.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-impact-transition",
    "category": "impact",
    "name": "impact-transition",
    "path": "/sfx/impact/impact-transition.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-impact-zoom-quick",
    "category": "impact",
    "name": "impact-zoom-quick",
    "path": "/sfx/impact/impact-zoom-quick.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-metal-spring-hit",
    "category": "impact",
    "name": "metal-spring-hit",
    "path": "/sfx/impact/metal-spring-hit.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "impact-stomp-apocalyptic",
    "category": "impact",
    "name": "stomp-apocalyptic",
    "path": "/sfx/impact/stomp-apocalyptic.mp3",
    "recommendedUse": "落地钉点、slam、重拍"
  },
  {
    "id": "light-light-aura",
    "category": "light",
    "name": "light-aura",
    "path": "/sfx/light/light-aura.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-light-spell",
    "category": "light",
    "name": "light-spell",
    "path": "/sfx/light/light-spell.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-light-sweep-magic",
    "category": "light",
    "name": "light-sweep-magic",
    "path": "/sfx/light/light-sweep-magic.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-light-transition-magic",
    "category": "light",
    "name": "light-transition-magic",
    "path": "/sfx/light/light-transition-magic.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-shimmer-sparkle-sweep",
    "category": "light",
    "name": "shimmer-sparkle-sweep",
    "path": "/sfx/light/shimmer-sparkle-sweep.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-sparkle",
    "category": "light",
    "name": "sparkle",
    "path": "/sfx/light/sparkle.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-sparkle-poof-hit",
    "category": "light",
    "name": "sparkle-poof-hit",
    "path": "/sfx/light/sparkle-poof-hit.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-sparkle-touch",
    "category": "light",
    "name": "sparkle-touch",
    "path": "/sfx/light/sparkle-touch.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-sparkle-wand",
    "category": "light",
    "name": "sparkle-wand",
    "path": "/sfx/light/sparkle-wand.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "light-stardust-swish",
    "category": "light",
    "name": "stardust-swish",
    "path": "/sfx/light/stardust-swish.mp3",
    "recommendedUse": "扫光、点亮、余韵"
  },
  {
    "id": "mech-door-open-futuristic",
    "category": "mech",
    "name": "door-open-futuristic",
    "path": "/sfx/mech/door-open-futuristic.mp3",
    "recommendedUse": "mech 材质拟音"
  },
  {
    "id": "mech-gear-lock-metallic",
    "category": "mech",
    "name": "gear-lock-metallic",
    "path": "/sfx/mech/gear-lock-metallic.mp3",
    "recommendedUse": "mech 材质拟音"
  },
  {
    "id": "mech-lock-digital",
    "category": "mech",
    "name": "lock-digital",
    "path": "/sfx/mech/lock-digital.mp3",
    "recommendedUse": "mech 材质拟音"
  },
  {
    "id": "mech-lock-quick",
    "category": "mech",
    "name": "lock-quick",
    "path": "/sfx/mech/lock-quick.mp3",
    "recommendedUse": "mech 材质拟音"
  },
  {
    "id": "mech-machine-activate-short",
    "category": "mech",
    "name": "machine-activate-short",
    "path": "/sfx/mech/machine-activate-short.mp3",
    "recommendedUse": "mech 材质拟音"
  },
  {
    "id": "mech-mech-robotic-futuristic",
    "category": "mech",
    "name": "mech-robotic-futuristic",
    "path": "/sfx/mech/mech-robotic-futuristic.mp3",
    "recommendedUse": "mech 材质拟音"
  },
  {
    "id": "mech-mech-tech-movement",
    "category": "mech",
    "name": "mech-tech-movement",
    "path": "/sfx/mech/mech-tech-movement.mp3",
    "recommendedUse": "mech 材质拟音"
  },
  {
    "id": "mech-metal-drop-scifi-small",
    "category": "mech",
    "name": "metal-drop-scifi-small",
    "path": "/sfx/mech/metal-drop-scifi-small.mp3",
    "recommendedUse": "mech 材质拟音"
  },
  {
    "id": "paper-paper-book-browse-fast",
    "category": "paper",
    "name": "paper-book-browse-fast",
    "path": "/sfx/paper/paper-book-browse-fast.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-crumple-quick",
    "category": "paper",
    "name": "paper-crumple-quick",
    "path": "/sfx/paper/paper-crumple-quick.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-move-quick",
    "category": "paper",
    "name": "paper-move-quick",
    "path": "/sfx/paper/paper-move-quick.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-page-turn",
    "category": "paper",
    "name": "paper-page-turn",
    "path": "/sfx/paper/paper-page-turn.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-page-turn-big",
    "category": "paper",
    "name": "paper-page-turn-big",
    "path": "/sfx/paper/paper-page-turn-big.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-scissors-cut",
    "category": "paper",
    "name": "paper-scissors-cut",
    "path": "/sfx/paper/paper-scissors-cut.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-slice-quick",
    "category": "paper",
    "name": "paper-slice-quick",
    "path": "/sfx/paper/paper-slice-quick.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-slide",
    "category": "paper",
    "name": "paper-slide",
    "path": "/sfx/paper/paper-slide.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-staple",
    "category": "paper",
    "name": "paper-staple",
    "path": "/sfx/paper/paper-staple.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "paper-paper-wind-blow",
    "category": "paper",
    "name": "paper-wind-blow",
    "path": "/sfx/paper/paper-wind-blow.mp3",
    "recommendedUse": "纸张、卡片、翻页"
  },
  {
    "id": "riser-riser-cine",
    "category": "riser",
    "name": "riser-cine",
    "path": "/sfx/riser/riser-cine.mp3",
    "recommendedUse": "riser 材质拟音"
  },
  {
    "id": "scifi-hitech-bleep",
    "category": "scifi",
    "name": "hitech-bleep",
    "path": "/sfx/scifi/hitech-bleep.mp3",
    "recommendedUse": "scifi 材质拟音"
  },
  {
    "id": "scifi-scifi-click",
    "category": "scifi",
    "name": "scifi-click",
    "path": "/sfx/scifi/scifi-click.mp3",
    "recommendedUse": "scifi 材质拟音"
  },
  {
    "id": "scifi-scifi-computer-ambience",
    "category": "scifi",
    "name": "scifi-computer-ambience",
    "path": "/sfx/scifi/scifi-computer-ambience.mp3",
    "recommendedUse": "scifi 材质拟音"
  },
  {
    "id": "scifi-space-intro-futuristic",
    "category": "scifi",
    "name": "space-intro-futuristic",
    "path": "/sfx/scifi/space-intro-futuristic.mp3",
    "recommendedUse": "scifi 材质拟音"
  },
  {
    "id": "scifi-tech-hum-futuristic",
    "category": "scifi",
    "name": "tech-hum-futuristic",
    "path": "/sfx/scifi/tech-hum-futuristic.mp3",
    "recommendedUse": "scifi 材质拟音"
  },
  {
    "id": "text-chalk-line",
    "category": "text",
    "name": "chalk-line",
    "path": "/sfx/text/chalk-line.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-keyboard",
    "category": "text",
    "name": "keyboard",
    "path": "/sfx/text/keyboard.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-marker-pen-line",
    "category": "text",
    "name": "marker-pen-line",
    "path": "/sfx/text/marker-pen-line.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-pen-click-twice",
    "category": "text",
    "name": "pen-click-twice",
    "path": "/sfx/text/pen-click-twice.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-pen-write-paper",
    "category": "text",
    "name": "pen-write-paper",
    "path": "/sfx/text/pen-write-paper.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-pencil-write-short",
    "category": "text",
    "name": "pencil-write-short",
    "path": "/sfx/text/pencil-write-short.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-typewriter-digital",
    "category": "text",
    "name": "typewriter-digital",
    "path": "/sfx/text/typewriter-digital.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-typewriter-hit-hard",
    "category": "text",
    "name": "typewriter-hit-hard",
    "path": "/sfx/text/typewriter-hit-hard.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-typewriter-hit-single",
    "category": "text",
    "name": "typewriter-hit-single",
    "path": "/sfx/text/typewriter-hit-single.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-typewriter-hit-soft",
    "category": "text",
    "name": "typewriter-hit-soft",
    "path": "/sfx/text/typewriter-hit-soft.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-typewriter-return-bell",
    "category": "text",
    "name": "typewriter-return-bell",
    "path": "/sfx/text/typewriter-return-bell.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-write-blackboard",
    "category": "text",
    "name": "write-blackboard",
    "path": "/sfx/text/write-blackboard.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "text-write-fast",
    "category": "text",
    "name": "write-fast",
    "path": "/sfx/text/write-fast.mp3",
    "recommendedUse": "打字、书写、下划线和标注"
  },
  {
    "id": "transition-air-whoosh-powerful",
    "category": "transition",
    "name": "air-whoosh-powerful",
    "path": "/sfx/transition/air-whoosh-powerful.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-air-woosh-deep",
    "category": "transition",
    "name": "air-woosh-deep",
    "path": "/sfx/transition/air-woosh-deep.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-air-woosh-quick",
    "category": "transition",
    "name": "air-woosh-quick",
    "path": "/sfx/transition/air-woosh-quick.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-air-zoom-vacuum",
    "category": "transition",
    "name": "air-zoom-vacuum",
    "path": "/sfx/transition/air-zoom-vacuum.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-sweep-fast",
    "category": "transition",
    "name": "sweep-fast",
    "path": "/sfx/transition/sweep-fast.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-sweep-fast-small",
    "category": "transition",
    "name": "sweep-fast-small",
    "path": "/sfx/transition/sweep-fast-small.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-sweep-metal-quick",
    "category": "transition",
    "name": "sweep-metal-quick",
    "path": "/sfx/transition/sweep-metal-quick.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-sweep-scifi-fast",
    "category": "transition",
    "name": "sweep-scifi-fast",
    "path": "/sfx/transition/sweep-scifi-fast.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-sweep-short",
    "category": "transition",
    "name": "sweep-short",
    "path": "/sfx/transition/sweep-short.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-swoosh-quick",
    "category": "transition",
    "name": "swoosh-quick",
    "path": "/sfx/transition/swoosh-quick.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-swoosh-slow",
    "category": "transition",
    "name": "swoosh-slow",
    "path": "/sfx/transition/swoosh-slow.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-transition-snap",
    "category": "transition",
    "name": "transition-snap",
    "path": "/sfx/transition/transition-snap.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-transition-soft",
    "category": "transition",
    "name": "transition-soft",
    "path": "/sfx/transition/transition-soft.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-transition-tech",
    "category": "transition",
    "name": "transition-tech",
    "path": "/sfx/transition/transition-tech.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-transition-tech-slide",
    "category": "transition",
    "name": "transition-tech-slide",
    "path": "/sfx/transition/transition-tech-slide.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-warp-slide",
    "category": "transition",
    "name": "warp-slide",
    "path": "/sfx/transition/warp-slide.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-whoosh-big",
    "category": "transition",
    "name": "whoosh-big",
    "path": "/sfx/transition/whoosh-big.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-whoosh-fast",
    "category": "transition",
    "name": "whoosh-fast",
    "path": "/sfx/transition/whoosh-fast.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-whoosh-swirl",
    "category": "transition",
    "name": "whoosh-swirl",
    "path": "/sfx/transition/whoosh-swirl.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-wind-pass-vibrate",
    "category": "transition",
    "name": "wind-pass-vibrate",
    "path": "/sfx/transition/wind-pass-vibrate.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-wind-swoosh-short",
    "category": "transition",
    "name": "wind-swoosh-short",
    "path": "/sfx/transition/wind-swoosh-short.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-wind-woosh-throw",
    "category": "transition",
    "name": "wind-woosh-throw",
    "path": "/sfx/transition/wind-woosh-throw.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "transition-wing-flutter",
    "category": "transition",
    "name": "wing-flutter",
    "path": "/sfx/transition/wing-flutter.mp3",
    "recommendedUse": "运镜、扫屏、元素飞入飞出"
  },
  {
    "id": "ui-chime-crystal",
    "category": "ui",
    "name": "chime-crystal",
    "path": "/sfx/ui/chime-crystal.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-hitech-touch-magnet",
    "category": "ui",
    "name": "hitech-touch-magnet",
    "path": "/sfx/ui/hitech-touch-magnet.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-pop",
    "category": "ui",
    "name": "pop",
    "path": "/sfx/ui/pop.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-pop-electric",
    "category": "ui",
    "name": "pop-electric",
    "path": "/sfx/ui/pop-electric.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-switch-click-quick",
    "category": "ui",
    "name": "switch-click-quick",
    "path": "/sfx/ui/switch-click-quick.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-switch-light",
    "category": "ui",
    "name": "switch-light",
    "path": "/sfx/ui/switch-light.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-switch-tap",
    "category": "ui",
    "name": "switch-tap",
    "path": "/sfx/ui/switch-tap.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-ui-click-tone",
    "category": "ui",
    "name": "ui-click-tone",
    "path": "/sfx/ui/ui-click-tone.mp3",
    "recommendedUse": "合成反馈音，先试听再用"
  },
  {
    "id": "ui-ui-confirm-bleep",
    "category": "ui",
    "name": "ui-confirm-bleep",
    "path": "/sfx/ui/ui-confirm-bleep.mp3",
    "recommendedUse": "合成反馈音，先试听再用"
  },
  {
    "id": "ui-ui-confirm-tone",
    "category": "ui",
    "name": "ui-confirm-tone",
    "path": "/sfx/ui/ui-confirm-tone.mp3",
    "recommendedUse": "合成反馈音，先试听再用"
  },
  {
    "id": "ui-ui-message-pop",
    "category": "ui",
    "name": "ui-message-pop",
    "path": "/sfx/ui/ui-message-pop.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-ui-notify-tech",
    "category": "ui",
    "name": "ui-notify-tech",
    "path": "/sfx/ui/ui-notify-tech.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-ui-option-select",
    "category": "ui",
    "name": "ui-option-select",
    "path": "/sfx/ui/ui-option-select.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-ui-popup-dry",
    "category": "ui",
    "name": "ui-popup-dry",
    "path": "/sfx/ui/ui-popup-dry.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-ui-select-click",
    "category": "ui",
    "name": "ui-select-click",
    "path": "/sfx/ui/ui-select-click.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-ui-select-modern",
    "category": "ui",
    "name": "ui-select-modern",
    "path": "/sfx/ui/ui-select-modern.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-ui-success-soft",
    "category": "ui",
    "name": "ui-success-soft",
    "path": "/sfx/ui/ui-success-soft.mp3",
    "recommendedUse": "点击、开关、pop"
  },
  {
    "id": "ui-ui-tone-quick",
    "category": "ui",
    "name": "ui-tone-quick",
    "path": "/sfx/ui/ui-tone-quick.mp3",
    "recommendedUse": "合成反馈音，先试听再用"
  }
] as SfxAsset[];
