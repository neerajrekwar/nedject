'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Code,
  Terminal,
  ShieldCheck,
  Zap,
  Key,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Sliders,
  Layers,
  Cpu,
  RefreshCw,
  Globe,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Share2,
  FileText,
  Radio,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';

type SdkLanguage = 'curl' | 'typescript' | 'python' | 'go' | 'php';
type DocSection = 'quickstart' | 'auth' | 'endpoints' | 'b2b-config' | 'errors' | 'webhooks' | 'sandbox';

export default function ApiDocsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'your-user-id';

  const [activeLang, setActiveLang] = useState<SdkLanguage>('curl');
  const [activeSection, setActiveSection] = useState<DocSection>('quickstart');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Sandbox Tester State
  const [sandboxApiKey, setSandboxApiKey] = useState<string>('ndj_live_sample_key_9921');
  const [sandboxOrigin, setSandboxOrigin] = useState<string>('http://localhost:3000');
  const [sandboxType, setSandboxType] = useState<'qr' | 'barcode'>('qr');
  const [sandboxPayload, setSandboxPayload] = useState<string>('https://nedject.com/docs/api');
  const [testingEndpoint, setTestingEndpoint] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono selection:bg-[#ccff00] selection:text-black py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. TOP HERO HEADER */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 border-2 border-black bg-[#ccff00] text-black shadow-[2px_2px_0px_#000000]">
              <Terminal className="w-6 h-6 stroke-[2.5]" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                DEVELOPER PLATFORM &amp; API SPECIFICATION // v1.4
              </span>
              <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
                <span>NEDJECT PEAR API DOCUMENTATION</span>
                <span className="text-xs bg-black text-[#ccff00] px-2 py-0.5 border border-black font-mono">
                  PUBLIC GATEWAY
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${userId}/pear`}
              className="px-3.5 py-1.5 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-xs font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>MANAGE KEYS &amp; ORIGINS</span>
            </Link>

            <Link
              href={`/${userId}/configration`}
              className="px-3.5 py-1.5 border-2 border-black bg-white hover:bg-[#ccff00] text-xs font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>B2B CONFIGURATION</span>
            </Link>

            <Link
              href="/"
              className="px-3.5 py-1.5 border-2 border-black bg-white hover:bg-zinc-100 text-xs font-black uppercase shadow-[2px_2px_0px_#000000]"
            >
              HOME
            </Link>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-700 font-sans leading-relaxed max-w-4xl">
          The <strong>Nedject Pear API Gateway</strong> provides ultra-low-latency programmatic rendering of
          prepress-grade optical assets: <strong>300 DPI Photo QR Codes</strong>, <strong>Vector Barcodes (CODE128, EAN13, DataMatrix)</strong>,
          <strong>CMYK Prepress Separations</strong>, and <strong>Web NFC NDEF Touches</strong>.
          Protected by strict <strong>Network Origin Whitelisting</strong>, SHA-256 key hashing, sliding-window rate limiters,
          and dynamic credit billing.
        </p>

        {/* Quick Nav Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10">
          <span className="text-[10px] font-black text-zinc-500 uppercase mr-1">JUMP TO:</span>
          {[
            { id: 'quickstart', label: '1. Quickstart Guide' },
            { id: 'auth', label: '2. Auth & Origin Defense' },
            { id: 'endpoints', label: '3. Endpoints Matrix' },
            { id: 'b2b-config', label: '4. Service Config Sync' },
            { id: 'errors', label: '5. Threat Codes & Quotas' },
            { id: 'webhooks', label: '6. HMAC Webhooks' },
            { id: 'sandbox', label: '7. Live Sandbox' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id as any);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 border border-black text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                activeSection === item.id ? 'bg-black text-[#ccff00]' : 'bg-zinc-100 hover:bg-zinc-200 text-black'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. STEP-BY-STEP QUICKSTART WALKTHROUGH */}
      <div id="quickstart" className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Zap className="w-5 h-5 text-black" />
          <h2 className="text-base font-black uppercase text-black">
            1. FOUR-STEP API SETUP &amp; CONNECTION LIFECYCLE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="border-2 border-black bg-zinc-50 p-5 space-y-3 shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="bg-black text-[#ccff00] text-[10px] px-2 py-0.5 font-black uppercase inline-block">
                STEP 1
              </span>
              <h3 className="font-black text-sm uppercase text-black">CREATE API KEY</h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Navigate to your{' '}
                <Link href={`/${userId}/pear`} className="font-bold underline text-black">
                  Pear API Gateway
                </Link>{' '}
                and generate a live key. Keys start with <code className="bg-zinc-200 px-1 font-mono text-[11px]">ndj_live_...</code>.
                Only the SHA-256 hash is saved in our database.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-200 text-[10px] text-zinc-500 font-mono">
              Key format: <span className="font-bold text-black">ndj_live_32chars</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border-2 border-black bg-zinc-50 p-5 space-y-3 shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="bg-black text-[#ccff00] text-[10px] px-2 py-0.5 font-black uppercase inline-block">
                STEP 2
              </span>
              <h3 className="font-black text-sm uppercase text-black">WHITELIST ORIGINS</h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Add your client domains or backends to the origin whitelist (e.g.{' '}
                <code className="bg-zinc-200 px-1 font-mono text-[11px]">https://store.example.com</code>).
                Our threat defense blocks requests without matching whitelisted origins.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-200 text-[10px] text-zinc-500 font-mono">
              Defense: <span className="font-bold text-emerald-700">Strict Match / 403 Threat Lock</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border-2 border-black bg-zinc-50 p-5 space-y-3 shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="bg-black text-[#ccff00] text-[10px] px-2 py-0.5 font-black uppercase inline-block">
                STEP 3
              </span>
              <h3 className="font-black text-sm uppercase text-black">SYNC B2B DEFAULTS</h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Optionally configure global prepress settings in{' '}
                <Link href={`/${userId}/configration`} className="font-bold underline text-black">
                  B2B Configuration
                </Link>{' '}
                (QR Error Correction &lsquo;H&rsquo;, 300/600 DPI, CMYK separation, Barcode symbologies).
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-200 text-[10px] text-zinc-500 font-mono">
              Config API: <span className="font-bold text-black">GET /api/user/config</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="border-2 border-black bg-zinc-50 p-5 space-y-3 shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="bg-black text-[#ccff00] text-[10px] px-2 py-0.5 font-black uppercase inline-block">
                STEP 4
              </span>
              <h3 className="font-black text-sm uppercase text-black">EXECUTE GENERATION</h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Send a <code className="bg-zinc-200 px-1 font-mono text-[11px]">POST /api/v1/generate</code> call with
                your Bearer token and origin header. Receive instant vector SVG or high-DPI raster assets.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-200 text-[10px] text-zinc-500 font-mono">
              Latency: <span className="font-bold text-black">&lt; 85ms median</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-LANGUAGE SDK CODE EXAMPLES */}
      <div id="auth" className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-black" />
            <h2 className="text-base font-black uppercase text-black">
              2. AUTHENTICATION &amp; MULTI-LANGUAGE INTEGRATION CODE
            </h2>
          </div>

          {/* Language Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 text-xs font-black">
            {[
              { id: 'curl', label: 'cURL' },
              { id: 'typescript', label: 'Node.js / TS' },
              { id: 'python', label: 'Python 3' },
              { id: 'go', label: 'Go' },
              { id: 'php', label: 'PHP' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveLang(lang.id as any)}
                className={`px-3 py-1.5 border-2 border-black uppercase text-[11px] cursor-pointer shadow-[2px_2px_0px_#000000] transition-colors ${
                  activeLang === lang.id ? 'bg-[#ccff00] text-black' : 'bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet Box with Copy Button */}
        <div className="border-2 border-black bg-zinc-950 text-[#ccff00] p-4 sm:p-6 font-mono text-xs relative overflow-x-auto shadow-[4px_4px_0px_#000000]">
          <button
            onClick={() => {
              let snippet = '';
              if (activeLang === 'curl') {
                snippet = `curl -X POST https://nedject.com/api/v1/generate \\
  -H "Authorization: Bearer ndj_live_YOUR_API_KEY" \\
  -H "Origin: https://store.example.com" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "qr",
    "payload": "https://store.example.com/item/4921",
    "format": "svg",
    "options": {
      "dpi": 300,
      "errorCorrection": "H",
      "colorSeparation": "CMYK-FOGRA39",
      "margin": 2
    }
  }'`;
              } else if (activeLang === 'typescript') {
                snippet = `import axios from 'axios';

const API_KEY = process.env.NEDJECT_API_KEY; // 'ndj_live_...'
const ORIGIN = 'https://store.example.com'; // Must match whitelisted origin

async function generateBarcodePass(code: string) {
  const response = await axios.post(
    'https://nedject.com/api/v1/generate',
    {
      type: 'barcode',
      payload: code,
      format: 'svg',
      options: {
        symbology: 'CODE128',
        barWidth: 2,
        barHeight: 100,
        displayValue: true
      }
    },
    {
      headers: {
        Authorization: \`Bearer \${API_KEY}\`,
        Origin: ORIGIN,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Asset URL:', response.data.assetUrl);
  console.log('Remaining Monthly Credits:', response.headers['x-credits-remaining']);
  return response.data;
}`;
              } else if (activeLang === 'python') {
                snippet = `import os
import requests

API_KEY = os.environ.get("NEDJECT_API_KEY") # 'ndj_live_...'
ORIGIN = "https://store.example.com"

response = requests.post(
    "https://nedject.com/api/v1/generate",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Origin": ORIGIN,
        "Content-Type": "application/json"
    },
    json={
        "type": "qr",
        "payload": "https://store.example.com/order/77102",
        "format": "png",
        "options": {
            "dpi": 600,
            "errorCorrection": "Q",
            "dotStyle": "rounded"
        }
    }
)

if response.status_code == 200:
    data = response.json()
    print("Rendered Asset:", data["assetUrl"])
    print("Credits Remaining:", response.headers.get("x-credits-remaining"))
else:
    print(f"Error {response.status_code}: {response.text}")`;
              } else if (activeLang === 'go') {
                snippet = `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func main() {
	apiKey := os.Getenv("NEDJECT_API_KEY")
	origin := "https://store.example.com"

	payload := map[string]interface{}{
		"type":    "qr",
		"payload": "https://store.example.com/order/9912",
		"format":  "svg",
		"options": map[string]interface{}{
			"dpi":             300,
			"errorCorrection": "H",
		},
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "https://nedject.com/api/v1/generate", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Origin", origin)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("HTTP Status:", resp.Status)
	fmt.Println("Credits Left:", resp.Header.Get("x-credits-remaining"))
}`;
              } else {
                snippet = `<?php
$apiKey = getenv('NEDJECT_API_KEY');
$origin = 'https://store.example.com';

$ch = curl_init('https://nedject.com/api/v1/generate');
$payload = json_encode([
    'type' => 'qr',
    'payload' => 'https://store.example.com/pass/1234',
    'format' => 'svg',
    'options' => [
        'dpi' => 300,
        'errorCorrection' => 'H',
        'colorSeparation' => 'CMYK-FOGRA39'
    ]
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Origin: ' . $origin,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n$result\n";`;
              }
              copyToClipboard(snippet, 'main_snippet');
            }}
            className="absolute top-4 right-4 px-3 py-1.5 border-2 border-[#ccff00] bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase shadow-[2px_2px_0px_#ccff00] flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copiedSnippet === 'main_snippet' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet === 'main_snippet' ? 'COPIED' : 'COPY CODE'}</span>
          </button>

          <pre className="whitespace-pre-wrap leading-relaxed pr-24">
            {activeLang === 'curl' &&
              `curl -X POST https://nedject.com/api/v1/generate \\
  -H "Authorization: Bearer ndj_live_YOUR_API_KEY" \\
  -H "Origin: https://store.example.com" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "qr",
    "payload": "https://store.example.com/item/4921",
    "format": "svg",
    "options": {
      "dpi": 300,
      "errorCorrection": "H",
      "colorSeparation": "CMYK-FOGRA39",
      "margin": 2
    }
  }'`}
            {activeLang === 'typescript' &&
              `import axios from 'axios';

const API_KEY = process.env.NEDJECT_API_KEY; // 'ndj_live_...'
const ORIGIN = 'https://store.example.com'; // Must match whitelisted origin

async function generateBarcodePass(code: string) {
  const response = await axios.post(
    'https://nedject.com/api/v1/generate',
    {
      type: 'barcode',
      payload: code,
      format: 'svg',
      options: {
        symbology: 'CODE128',
        barWidth: 2,
        barHeight: 100,
        displayValue: true
      }
    },
    {
      headers: {
        Authorization: \`Bearer \${API_KEY}\`,
        Origin: ORIGIN,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Asset URL:', response.data.assetUrl);
  console.log('Remaining Monthly Credits:', response.headers['x-credits-remaining']);
  return response.data;
}`}
            {activeLang === 'python' &&
              `import os
import requests

API_KEY = os.environ.get("NEDJECT_API_KEY") # 'ndj_live_...'
ORIGIN = "https://store.example.com"

response = requests.post(
    "https://nedject.com/api/v1/generate",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Origin": ORIGIN,
        "Content-Type": "application/json"
    },
    json={
        "type": "qr",
        "payload": "https://store.example.com/order/77102",
        "format": "png",
        "options": {
            "dpi": 600,
            "errorCorrection": "Q",
            "dotStyle": "rounded"
        }
    }
)

if response.status_code == 200:
    data = response.json()
    print("Rendered Asset:", data["assetUrl"])
    print("Credits Remaining:", response.headers.get("x-credits-remaining"))
else:
    print(f"Error {response.status_code}: {response.text}")`}
            {activeLang === 'go' &&
              `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func main() {
	apiKey := os.Getenv("NEDJECT_API_KEY")
	origin := "https://store.example.com"

	payload := map[string]interface{}{
		"type":    "qr",
		"payload": "https://store.example.com/order/9912",
		"format":  "svg",
		"options": map[string]interface{}{
			"dpi":             300,
			"errorCorrection": "H",
		},
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "https://nedject.com/api/v1/generate", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Origin", origin)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("HTTP Status:", resp.Status)
	fmt.Println("Credits Left:", resp.Header.Get("x-credits-remaining"))
}`}
            {activeLang === 'php' &&
              `<?php
$apiKey = getenv('NEDJECT_API_KEY');
$origin = 'https://store.example.com';

$ch = curl_init('https://nedject.com/api/v1/generate');
$payload = json_encode([
    'type' => 'qr',
    'payload' => 'https://store.example.com/pass/1234',
    'format' => 'svg',
    'options' => [
        'dpi' => 300,
        'errorCorrection' => 'H',
        'colorSeparation' => 'CMYK-FOGRA39'
    ]
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Origin: ' . $origin,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n$result\n";`}
          </pre>
        </div>
      </div>

      {/* 4. COMPLETE ENDPOINTS SPECIFICATION */}
      <div id="endpoints" className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Layers className="w-5 h-5 text-black" />
          <h2 className="text-base font-black uppercase text-black">
            3. REST ENDPOINT MATRIX &amp; PARAMETER SCHEMAS
          </h2>
        </div>

        {/* Endpoint 1: POST /api/v1/generate */}
        <div className="border-2 border-black bg-zinc-50 p-5 space-y-4 shadow-[3px_3px_0px_#000000]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-black text-[#ccff00] font-black px-2 py-0.5 text-xs">POST</span>
              <code className="text-sm font-black text-black">/api/v1/generate</code>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400 font-black px-2 py-0.5 uppercase">
              Optical Render Gateway (Credits Billed)
            </span>
          </div>

          <p className="text-xs text-zinc-700 font-sans">
            Primary high-speed optical synthesis pipeline. Processes vector QR codes, prepress DPI formatting, and barcodes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Headers */}
            <div className="bg-white border border-black p-3 space-y-2">
              <span className="text-[10px] font-black uppercase text-zinc-500 block">REQUIRED HEADERS:</span>
              <ul className="space-y-1 text-[11px]">
                <li><strong className="text-black">Authorization:</strong> <code>Bearer ndj_live_...</code></li>
                <li><strong className="text-black">Origin:</strong> <code>https://whitelisted-domain.com</code></li>
                <li><strong className="text-black">Content-Type:</strong> <code>application/json</code></li>
              </ul>
            </div>

            {/* Response Headers */}
            <div className="bg-white border border-black p-3 space-y-2">
              <span className="text-[10px] font-black uppercase text-zinc-500 block">TELEMETRY RESPONSE HEADERS:</span>
              <ul className="space-y-1 text-[11px]">
                <li><code>x-credits-remaining</code>: Credits left in current billing cycle</li>
                <li><code>x-origin-verified</code>: <code>true</code> if Origin header matched whitelist</li>
                <li><code>x-ratelimit-remaining</code>: Requests left in 60s sliding window</li>
              </ul>
            </div>
          </div>

          {/* Request Body JSON schema */}
          <div className="bg-white border border-black p-3 space-y-1.5 font-mono text-xs">
            <span className="text-[10px] font-black uppercase text-zinc-500 block">REQUEST PAYLOAD (JSON):</span>
            <pre className="text-[11px] bg-zinc-100 p-3 border border-zinc-300 text-zinc-800 overflow-x-auto">
{`{
  "type": "qr" | "barcode" | "photo-dpi" | "nfc",
  "payload": "https://example.com/asset-data",
  "format": "svg" | "png" | "pdf",
  "options": {
    "dpi": 300 | 600 | 1200,
    "errorCorrection": "L" | "M" | "Q" | "H",
    "colorSeparation": "sRGB" | "CMYK-FOGRA39",
    "dotStyle": "square" | "rounded" | "dots",
    "symbology": "CODE128" | "EAN13" | "UPC" | "ITF14" | "DATAMATRIX",
    "margin": 2
  }
}`}
            </pre>
          </div>
        </div>

        {/* Endpoint 2: GET & POST /api/user/config */}
        <div id="b2b-config" className="border-2 border-black bg-zinc-50 p-5 space-y-4 shadow-[3px_3px_0px_#000000]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white font-black px-2 py-0.5 text-xs">GET / POST</span>
              <code className="text-sm font-black text-black">/api/user/config</code>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-900 border border-blue-400 font-black px-2 py-0.5 uppercase">
              B2B Service Configuration Sync
            </span>
          </div>

          <p className="text-xs text-zinc-700 font-sans">
            Read or update a tenant&apos;s default prepress parameters programmatically, avoiding hardcoded DPI or symbology values in client code.
          </p>

          <div className="bg-white border border-black p-3 space-y-1.5 font-mono text-xs">
            <span className="text-[10px] font-black uppercase text-zinc-500 block">READ CONFIG (CURL):</span>
            <pre className="text-[11px] bg-zinc-100 p-2.5 border border-zinc-300 text-zinc-800 overflow-x-auto">
{`curl -X GET "https://nedject.com/api/user/config?userId=YOUR_USER_ID" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
            </pre>
          </div>
        </div>
      </div>

      {/* 5. THREAT CODES, QUOTAS & ERROR MATRIX */}
      <div id="errors" className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <AlertTriangle className="w-5 h-5 text-black" />
          <h2 className="text-base font-black uppercase text-black">
            4. THREAT CODES, RATE LIMITS &amp; PLAN QUOTAS
          </h2>
        </div>

        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-black text-[#ccff00] border-b-2 border-black">
                <th className="p-2.5 border-r border-zinc-700">HTTP CODE</th>
                <th className="p-2.5 border-r border-zinc-700">ERROR TYPE</th>
                <th className="p-2.5 border-r border-zinc-700">REASON &amp; THREAT TELEMETRY</th>
                <th className="p-2.5">RESOLUTION ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 bg-white">
                <td className="p-2.5 font-black text-emerald-700 border-r border-zinc-200">200 OK</td>
                <td className="p-2.5 font-bold border-r border-zinc-200">SUCCESS</td>
                <td className="p-2.5 border-r border-zinc-200 text-zinc-600 font-sans">
                  Origin matches whitelist and key is valid. Asset generated.
                </td>
                <td className="p-2.5 font-bold text-zinc-800">None. Output asset URL returned.</td>
              </tr>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <td className="p-2.5 font-black text-rose-700 border-r border-zinc-200">401 UNAUTHORIZED</td>
                <td className="p-2.5 font-bold border-r border-zinc-200">INVALID_KEY</td>
                <td className="p-2.5 border-r border-zinc-200 text-zinc-600 font-sans">
                  Bearer token missing, formatted incorrectly, or revoked.
                </td>
                <td className="p-2.5 font-bold text-zinc-800">Generate or rotate API key in Pear Gateway.</td>
              </tr>
              <tr className="border-b border-zinc-200 bg-white">
                <td className="p-2.5 font-black text-rose-700 border-r border-zinc-200">403 FORBIDDEN</td>
                <td className="p-2.5 font-bold border-r border-zinc-200">ORIGIN_FORBIDDEN</td>
                <td className="p-2.5 border-r border-zinc-200 text-zinc-600 font-sans">
                  The <code className="bg-zinc-200 px-1 font-bold">Origin</code> header did not match any whitelisted origins.
                </td>
                <td className="p-2.5 font-bold text-zinc-800">
                  Add client domain to whitelist in{' '}
                  <Link href={`/${userId}/pear`} className="underline">
                    Pear Gateway
                  </Link>.
                </td>
              </tr>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <td className="p-2.5 font-black text-amber-700 border-r border-zinc-200">402 PAYMENT REQUIRED</td>
                <td className="p-2.5 font-bold border-r border-zinc-200">CREDITS_EXHAUSTED</td>
                <td className="p-2.5 border-r border-zinc-200 text-zinc-600 font-sans">
                  Monthly optical generation credits depleted for current tier.
                </td>
                <td className="p-2.5 font-bold text-zinc-800">
                  Upgrade to Starter, Pro, or Enterprise in{' '}
                  <Link href="/pay-to-use" className="underline">
                    Plans
                  </Link>.
                </td>
              </tr>
              <tr className="bg-white">
                <td className="p-2.5 font-black text-purple-700 border-r border-zinc-200">429 RATE LIMIT</td>
                <td className="p-2.5 font-bold border-r border-zinc-200">RATE_LIMIT_EXCEEDED</td>
                <td className="p-2.5 border-r border-zinc-200 text-zinc-600 font-sans">
                  Request volume exceeded sliding 60-second RPM ceiling.
                </td>
                <td className="p-2.5 font-bold text-zinc-800">Implement exponential backoff retry.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Plan Quotas Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="border-2 border-black bg-zinc-50 p-3">
            <span className="text-[10px] font-black text-zinc-500 uppercase block">FREE TIER</span>
            <span className="font-black text-black block mt-0.5">10 Credits / mo</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">20 RPM • 1 Origin</span>
          </div>
          <div className="border-2 border-black bg-zinc-50 p-3">
            <span className="text-[10px] font-black text-zinc-500 uppercase block">STARTER TIER</span>
            <span className="font-black text-black block mt-0.5">500 Credits / mo</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">60 RPM • 5 Origins</span>
          </div>
          <div className="border-2 border-black bg-zinc-50 p-3">
            <span className="text-[10px] font-black text-zinc-500 uppercase block">PRO TIER</span>
            <span className="font-black text-emerald-700 block mt-0.5">UNLIMITED CREDITS</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">300 RPM • 15 Origins</span>
          </div>
          <div className="border-2 border-black bg-zinc-50 p-3">
            <span className="text-[10px] font-black text-zinc-500 uppercase block">ENTERPRISE TIER</span>
            <span className="font-black text-emerald-700 block mt-0.5">UNLIMITED CREDITS</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">1200 RPM • Unlimited Origins</span>
          </div>
        </div>
      </div>

      {/* 6. WEBHOOKS & HMAC SIGNATURE VERIFICATION */}
      <div id="webhooks" className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <Lock className="w-5 h-5 text-black" />
          <h2 className="text-base font-black uppercase text-black">
            5. WEBHOOK RELAYS &amp; HMAC-SHA256 SIGNATURE VERIFICATION
          </h2>
        </div>

        <p className="text-xs text-zinc-700 font-sans leading-relaxed">
          When asynchronous generation batches complete or credit quotas hit low thresholds, Nedject pushes event payloads
          to your configured webhook URL. Every webhook includes an <code className="bg-zinc-200 px-1 font-bold">X-Nedject-Signature</code>{' '}
          header calculated using HMAC-SHA256 and your signing secret.
        </p>

        <div className="border-2 border-black bg-zinc-950 text-[#ccff00] p-4 font-mono text-xs overflow-x-auto shadow-[3px_3px_0px_#000000]">
          <pre className="whitespace-pre-wrap leading-relaxed">
{`// Node.js Webhook Verification Middleware
import crypto from 'crypto';

export function verifyNedjectWebhook(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  const computedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(computedHash)
  );
}`}
          </pre>
        </div>
      </div>

      {/* 7. LIVE INTERACTIVE API TEST RUNNER */}
      <div id="sandbox" className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-black" />
            <h2 className="text-base font-black uppercase text-black">
              6. LIVE ENDPOINT TEST RUNNER &amp; SIMULATOR
            </h2>
          </div>
          <span className="text-[10px] font-black bg-[#ccff00] text-black px-2 py-0.5 border border-black uppercase">
            REALTIME GATEWAY REQUEST
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (5 cols) */}
          <div className="lg:col-span-5 border-2 border-black bg-zinc-50 p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-600 block">
                API KEY (BEARER TOKEN):
              </label>
              <input
                type="text"
                value={sandboxApiKey}
                onChange={(e) => setSandboxApiKey(e.target.value)}
                className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-600 block">
                ORIGIN HEADER (MUST BE WHITELISTED):
              </label>
              <input
                type="text"
                value={sandboxOrigin}
                onChange={(e) => setSandboxOrigin(e.target.value)}
                className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">SERVICE TYPE:</label>
                <select
                  value={sandboxType}
                  onChange={(e) => setSandboxType(e.target.value as any)}
                  className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
                >
                  <option value="qr">QR Engine</option>
                  <option value="barcode">Barcode</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">TARGET FORMAT:</label>
                <select className="w-full border-2 border-black p-2 font-mono text-xs bg-white">
                  <option value="svg">Vector SVG</option>
                  <option value="png">PNG (300 DPI)</option>
                  <option value="pdf">Prepress PDF</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-600 block">TEST PAYLOAD:</label>
              <input
                type="text"
                value={sandboxPayload}
                onChange={(e) => setSandboxPayload(e.target.value)}
                className="w-full border-2 border-black p-2 font-mono text-xs bg-white"
              />
            </div>

            <button
              onClick={async () => {
                setTestingEndpoint(true);
                setTestResult(null);
                const startTime = performance.now();

                try {
                  const res = await fetch('/api/v1/generate', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${sandboxApiKey}`,
                      Origin: sandboxOrigin,
                    },
                    body: JSON.stringify({
                      type: sandboxType,
                      payload: sandboxPayload,
                      format: 'svg',
                      options: { dpi: 300, errorCorrection: 'H' },
                    }),
                  });

                  const latencyMs = Math.round(performance.now() - startTime);
                  const data = await res.json().catch(() => null);

                  setTestResult({
                    status: res.status,
                    ok: res.ok,
                    latencyMs,
                    headers: {
                      'x-origin-verified': res.headers.get('x-origin-verified') || 'false',
                      'x-credits-remaining': res.headers.get('x-credits-remaining') || 'unknown',
                      'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining') || 'unknown',
                    },
                    body: data,
                  });
                } catch (err: any) {
                  setTestResult({
                    status: 0,
                    ok: false,
                    latencyMs: Math.round(performance.now() - startTime),
                    error: err.message || 'Network connection failed',
                  });
                } finally {
                  setTestingEndpoint(false);
                }
              }}
              disabled={testingEndpoint}
              className="w-full py-3 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] font-black text-xs uppercase shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer transition-colors active:translate-x-0.5 active:translate-y-0.5"
            >
              {testingEndpoint ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>TRANSMITTING APPARATUS...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>DISPATCH GATEWAY CALL</span>
                </>
              )}
            </button>
          </div>

          {/* Results Console (7 cols) */}
          <div className="lg:col-span-7 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase block">REALTIME GATEWAY RESPONSE:</span>

              {testResult ? (
                <div
                  className={`border-2 border-black p-4 font-mono text-xs shadow-[3px_3px_0px_#000000] ${
                    testResult.ok ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-black/20 pb-2 mb-3 font-bold">
                    <span className={testResult.ok ? 'text-emerald-800' : 'text-red-800'}>
                      HTTP {testResult.status} {testResult.ok ? 'OK' : 'DENIED / ERROR'}
                    </span>
                    <span className="text-zinc-600 text-[10px]">{testResult.latencyMs} ms latency</span>
                  </div>

                  <div className="text-[11px] space-y-1 mb-3 text-zinc-800 font-mono">
                    <div>x-origin-verified: <strong>{testResult.headers?.['x-origin-verified']}</strong></div>
                    <div>x-credits-remaining: <strong>{testResult.headers?.['x-credits-remaining']}</strong></div>
                    <div>x-ratelimit-remaining: <strong>{testResult.headers?.['x-ratelimit-remaining']}</strong></div>
                  </div>

                  <pre className="text-[11px] overflow-x-auto bg-black text-[#ccff00] p-3 border border-black max-h-56">
                    {JSON.stringify(testResult.body || testResult.error, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-zinc-300 text-center text-zinc-500 bg-zinc-50 text-xs">
                  Click &quot;DISPATCH GATEWAY CALL&quot; to test your headers and credentials against the live pipeline.
                </div>
              )}
            </div>

            <div className="pt-2 text-[10px] text-zinc-500 font-mono">
              Note: Testing in this live sandbox executes against the active <code className="bg-zinc-200 px-1 font-bold">/api/v1/generate</code> route.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
