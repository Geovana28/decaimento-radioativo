# ☢️ Simulador de Decaimento Radioativo

Laboratório interativo de física nuclear com visualização de átomos, curva de decaimento exponencial e calculadora de datação por carbono-14.

## 🚀 Funcionalidades

- **6 Isótopos Reais** — C-14, U-238, K-40, U-235, I-131, Sr-90
- **Visualização de Átomos** — Canvas com partículas ativas/decaídas
- **Curva de Decaimento** — Gráfico N(t) com Chart.js
- **Datação de Fósseis** — Calculadora interativa de idade
- **Dados Científicos** — Constante λ, meia-vida, tempo médio, atividade

## 🧮 Modelagem Matemática

```
N(t) = N₀ · e^(−λt)          (Átomos restantes)
λ = ln(2) / t½               (Constante de decaimento)
t = −ln(N/N₀) / λ            (Idade a partir da fração)
```

## 🛠️ Tecnologias

- JavaScript Vanilla (ES6+)
- Chart.js 4.4 + Canvas 2D
- CSS3 com Glassmorphism
- Google Fonts (Inter, JetBrains Mono)

## 📦 Como Executar

Abra `index.html` no navegador — Chart.js carregado via CDN.

## 📁 Estrutura

```
decaimento-radioativo/
├── index.html    # Estrutura e layout
├── script.js     # Motor de simulação nuclear
└── style.css     # Design premium dark theme
```

## ⚠️ Hipóteses Físicas e Limitações

1. **Decaimento de Passo Único**: Modela a transição direta do radionuclídeo pai para o núcleo filho estável ($N(t) = N_0 e^{-\lambda t}$), sem cadeias intermediárias de decaimento em série (equações de Bateman).
2. **Flutuação Estocástica de Pequenas Amostras**: Na simulação discreta de partículas em Canvas ($N_0 \sim 10^2\text{–}10^3$), observa-se o ruído binomial/Poisson natural em torno da curva analítica contínua (que é exata no limite termodinâmico $N_0 \to 10^{23}$).
3. **Datação por Carbono-14**: Assume razão isotópica atmosférica inicial $^{14}\text{C}/^{12}\text{C}$ constante, sem aplicar curvas de calibração dendrocronológica (IntCal).

---

Desenvolvido por **Geovana** | Distribuído sob Licença MIT (`LICENSE`) | [Portfólio](../portfolio/index.html)
