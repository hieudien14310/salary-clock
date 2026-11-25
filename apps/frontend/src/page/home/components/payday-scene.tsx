type PaydaySceneProps = {
  speech: string;
  paydayLabel: string;
  isCelebrating: boolean;
};

export function PaydayScene({ speech, paydayLabel, isCelebrating }: PaydaySceneProps) {
  const speechLines = speech.split('\n');

  return (
    <svg
      id="payday-scene"
      className="payday-scene w-full max-w-[520px]"
      viewBox="0 0 520 320"
      role="img"
      aria-label={
        isCelebrating
          ? 'Bạn nam mỉm cười, giơ điện thoại mừng lương về giữa những mảnh confetti.'
          : 'Bạn nam ngồi trên ghế, đung đưa chân và nhìn điện thoại chờ ngày lương, cạnh ly cà phê và đồng hồ.'
      }
    >
      <g aria-hidden="true">
        <circle cx="306" cy="158" r="126" fill="var(--scene-halo)" />
        <circle
          cx="306"
          cy="158"
          r="144"
          fill="none"
          stroke="var(--scene-halo-ring)"
          strokeWidth="2"
          strokeDasharray="4 8"
        />
        <ellipse cx="291" cy="294" rx="171" ry="12" fill="var(--scene-shadow)" />
        <path d="M101 294H469" stroke="var(--scene-line)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Clock, payday calendar, and thought bubble in hand-drawn brown line art. */}
        <g stroke="var(--scene-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="235" cy="54" r="25" fill="var(--scene-paper)" />
          <circle cx="235" cy="54" r="20" fill="none" stroke="var(--scene-halo)" strokeWidth="2" />
          <path d="M235 34V37M255 54H252M235 74V71M215 54H218" stroke="var(--scene-line)" />
          <path d="M235 54L227 48" />
          <path className="payday-clock-hand" d="M235 54V39" stroke="var(--scene-coral)" />
          <circle cx="235" cy="54" r="2.2" fill="var(--scene-ink)" stroke="none" />
        </g>

        <g className="payday-calendar">
          <rect x="391" y="47" width="70" height="78" rx="14" fill="var(--scene-shadow)" />
          <rect
            x="387"
            y="42"
            width="70"
            height="78"
            rx="14"
            fill="var(--scene-paper)"
            stroke="var(--scene-ink)"
            strokeWidth="2.2"
          />
          <path
            d="M399 42H445Q457 42 457 54V66H387V54Q387 42 399 42Z"
            fill="var(--scene-coral)"
            stroke="var(--scene-ink)"
            strokeWidth="2.2"
          />
          <path d="M403 36V47M441 36V47" stroke="var(--scene-ink)" strokeWidth="3.5" strokeLinecap="round" />
          <text
            x="422"
            y="58"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1"
            fill="var(--scene-paper)"
          >
            NGÀY LƯƠNG
          </text>
          <text x="422" y="102" textAnchor="middle" fontSize="29" fontWeight="700" fill="var(--scene-burgundy)">
            {paydayLabel}
          </text>
        </g>

        <g className="payday-thought">
          <path
            d="M68 91H184Q198 91 198 105V128Q198 142 184 142H162L172 156L146 142H68Q54 142 54 128V105Q54 91 68 91Z"
            fill="var(--scene-paper)"
            stroke="var(--scene-ink)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <text
            x="126"
            y={speechLines.length > 1 ? 113 : 121}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="var(--scene-ink)"
          >
            {speechLines.map((line, index) => (
              <tspan key={index} x="126" dy={index === 0 ? 0 : 16}>
                {line}
              </tspan>
            ))}
          </text>
          <circle cx="185" cy="165" r="4" fill="var(--scene-paper)" stroke="var(--scene-ink)" strokeWidth="1.8" />
          <circle cx="201" cy="175" r="2.6" fill="var(--scene-paper)" stroke="var(--scene-ink)" strokeWidth="1.8" />
        </g>

        {/* Potted plant and coffee table. */}
        <g stroke="var(--scene-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M132 264V215M132 243L114 225M132 235L151 216" fill="none" stroke="var(--scene-green-deep)" />
          <path
            d="M132 224C109 212 118 192 118 192S140 200 132 224Z"
            fill="var(--scene-leaf)"
            stroke="var(--scene-ink)"
            strokeWidth="2"
          />
          <path
            d="M133 237C131 212 157 203 157 203S162 226 133 237Z"
            fill="var(--scene-green)"
            stroke="var(--scene-ink)"
            strokeWidth="2"
          />
          <path
            d="M125 241C102 242 100 218 100 218S124 218 125 241Z"
            fill="var(--scene-green)"
            stroke="var(--scene-ink)"
            strokeWidth="2"
          />
          <path d="M112 260H151L145 289Q144 294 139 294H124Q119 294 118 289Z" fill="var(--scene-clay)" />
          <rect x="109" y="257" width="45" height="8" rx="4" fill="var(--scene-peach)" />
        </g>

        <g stroke="var(--scene-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M187 239L179 291M230 239L238 291" stroke="var(--scene-ink)" strokeWidth="7" />
          <path d="M187 239L179 291M230 239L238 291" stroke="var(--scene-wood)" strokeWidth="3.5" />
          <rect x="171" y="231" width="76" height="9" rx="4.5" fill="var(--scene-wood)" />
          <ellipse cx="207" cy="229" rx="19" ry="3" fill="var(--scene-shadow)" stroke="none" />
          <path d="M215 209H221Q230 217 218 223H215" fill="none" stroke="var(--scene-ink)" strokeWidth="4.2" />
          <path d="M215 209H221Q230 217 218 223H215" fill="none" stroke="var(--scene-blue)" strokeWidth="2" />
          <path d="M191 205H217V222Q217 229 210 229H198Q191 229 191 222Z" fill="var(--scene-blue)" />
          <ellipse cx="204" cy="205" rx="13" ry="3" fill="var(--scene-wood)" />
          <path d="M195 212V220" stroke="var(--scene-paper)" strokeWidth="2" />
        </g>
        <g fill="none" stroke="var(--scene-steam)" strokeWidth="2" strokeLinecap="round">
          <path className="payday-steam" d="M199 195C192 189 204 184 198 178" />
          <path className="payday-steam payday-steam-delayed" d="M210 194C203 187 215 184 209 176" />
        </g>

        {/* Chair and legs with uniform espresso outline. */}
        <path d="M290 224L278 290M350 224L367 290" stroke="var(--scene-ink)" strokeWidth="8.5" strokeLinecap="round" />
        <path d="M290 224L278 290M350 224L367 290" stroke="var(--scene-wood)" strokeWidth="4.5" strokeLinecap="round" />
        <path
          d="M336 147H348Q365 147 362 164L354 219H326Z"
          fill="var(--scene-chair)"
          stroke="var(--scene-ink)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        <path
          d="M293 207L271 231L263 277"
          fill="none"
          stroke="var(--scene-ink)"
          strokeWidth="25"
          strokeLinejoin="round"
        />
        <path
          d="M293 207L271 231L263 277"
          fill="none"
          stroke="var(--scene-denim)"
          strokeWidth="20.5"
          strokeLinejoin="round"
        />
        <path d="M254 274L270 276L269 285H252Z" fill="var(--scene-skin)" stroke="var(--scene-ink)" strokeWidth="2" />
        <path
          d="M253 281L268 283L274 292Q274 296 269 296H241Q239 289 253 281Z"
          fill="var(--scene-paper)"
          stroke="var(--scene-ink)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M242 293H271" stroke="var(--scene-ink)" strokeWidth="2.5" strokeLinecap="round" />

        <path
          d="M296 199Q308 200 320 209L335 230"
          fill="none"
          stroke="var(--scene-ink)"
          strokeWidth="28"
          strokeLinecap="round"
        />
        <path
          d="M296 199Q308 200 320 209L335 230"
          fill="none"
          stroke="var(--scene-denim-dark)"
          strokeWidth="23.5"
          strokeLinecap="round"
        />
        <g className="payday-swinging-leg">
          <path d="M335 230L325 273" stroke="var(--scene-ink)" strokeWidth="25" strokeLinecap="round" />
          <path d="M335 230L325 273" stroke="var(--scene-denim-dark)" strokeWidth="20.5" strokeLinecap="round" />
          <path d="M317 269L333 272L331 282H315Z" fill="var(--scene-skin)" stroke="var(--scene-ink)" strokeWidth="2" />
          <path
            d="M316 278L331 281Q334 287 345 289Q349 290 348 296H315Q309 293 316 278Z"
            fill="var(--scene-paper)"
            stroke="var(--scene-ink)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M315 293H345M328 284L333 285" stroke="var(--scene-ink)" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <rect
          x="278"
          y="216"
          width="79"
          height="11"
          rx="5.5"
          fill="var(--scene-chair)"
          stroke="var(--scene-ink)"
          strokeWidth="2.2"
        />

        <g className="payday-body">
          <path
            d="M278 137Q294 128 315 134Q332 138 335 157L329 204Q304 215 276 201L271 163Q268 148 278 137Z"
            fill="var(--scene-green)"
            stroke="var(--scene-ink)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M278 189Q303 199 330 191L329 204Q303 214 276 201Z" fill="var(--scene-green-deep)" opacity="0.28" />
          <path
            d="M295 124V137Q304 146 314 134L311 119"
            fill="var(--scene-skin)"
            stroke="var(--scene-ink)"
            strokeWidth="2.2"
          />
          <path d="M296 127Q305 132 312 126V119H297Z" fill="var(--scene-skin-shadow)" />

          <path
            d="M279 150L268 179Q265 185 273 189L292 196"
            fill="none"
            stroke="var(--scene-ink)"
            strokeWidth="21"
            strokeLinecap="round"
          />
          <path
            d="M279 150L268 179Q265 185 273 189L292 196"
            fill="none"
            stroke="var(--scene-green)"
            strokeWidth="16.5"
            strokeLinecap="round"
          />
          <path d="M282 192L296 198" stroke="var(--scene-ink)" strokeWidth="14" strokeLinecap="round" />
          <path d="M282 192L296 198" stroke="var(--scene-skin)" strokeWidth="10" strokeLinecap="round" />

          <g className="payday-phone-arm">
            <path d="M326 149L340 176" stroke="var(--scene-ink)" strokeWidth="21" strokeLinecap="round" />
            <path d="M326 149L340 176" stroke="var(--scene-green)" strokeWidth="16.5" strokeLinecap="round" />
            <path d="M340 176L357 153" stroke="var(--scene-ink)" strokeWidth="15" strokeLinecap="round" />
            <path d="M340 176L357 153" stroke="var(--scene-skin)" strokeWidth="10.5" strokeLinecap="round" />
            <rect
              x="348"
              y="125"
              width="23"
              height="38"
              rx="6"
              transform="rotate(12 359 144)"
              fill="var(--scene-ink)"
            />
            <path d="M355 131L367 134L362 153L350 150Z" fill="var(--scene-leaf)" />
            <path d="M353 153L356 147" stroke="var(--scene-skin)" strokeWidth="7" strokeLinecap="round" />
            {isCelebrating && (
              <path
                d="M355 141L358 144L363 138"
                fill="none"
                stroke="var(--scene-green-deep)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}
          </g>

          <g className="payday-head">
            <path
              d="M280 94Q277 68 303 67Q331 67 331 93L326 112L281 108Z"
              fill="var(--scene-hair)"
              stroke="var(--scene-ink)"
              strokeWidth="2.2"
            />
            <path
              d="M287 86Q304 94 321 83L327 104Q332 108 326 112L321 114Q319 129 305 130Q285 128 283 108Z"
              fill="var(--scene-skin)"
              stroke="var(--scene-ink)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <ellipse
              cx="284"
              cy="105"
              rx="7"
              ry="9"
              fill="var(--scene-skin)"
              stroke="var(--scene-ink)"
              strokeWidth="2.2"
            />
            <path
              d="M282 103Q287 100 287 107"
              fill="none"
              stroke="var(--scene-skin-shadow)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M280 96Q274 78 285 73Q283 63 294 65Q307 56 316 66Q338 65 332 82Q322 93 305 86Q293 89 289 98L287 104L283 98Z"
              fill="var(--scene-hair)"
              stroke="var(--scene-ink)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M291 75Q307 69 320 76"
              fill="none"
              stroke="var(--scene-line)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M299 97L305 96M316 95L321 96" stroke="var(--scene-ink)" strokeWidth="2" strokeLinecap="round" />
            <g className="payday-eyes" fill="var(--scene-ink)">
              <ellipse cx="303" cy="103" rx="2.1" ry="2.8" />
              <ellipse cx="319" cy="102" rx="2.1" ry="2.8" />
            </g>
            <path
              d="M312 103L314 110H310"
              fill="none"
              stroke="var(--scene-skin-shadow)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={isCelebrating ? 'M301 115Q309 128 318 114Z' : 'M305 117Q310 120 315 116'}
              fill={isCelebrating ? 'var(--scene-paper)' : 'none'}
              stroke="var(--scene-burgundy)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <ellipse cx="296" cy="112" rx="5.5" ry="2.8" fill="var(--scene-coral)" opacity="0.35" />
          </g>
        </g>

        <g className="payday-coin">
          <circle cx="405" cy="187" r="17" fill="var(--scene-gold)" stroke="var(--scene-ink)" strokeWidth="2.2" />
          <circle cx="405" cy="187" r="12.5" fill="none" stroke="var(--scene-paper)" strokeWidth="1.4" opacity="0.7" />
          <text x="405" y="193" textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--scene-ink)">
            ₫
          </text>
        </g>
        <path
          className="payday-sparkle"
          d="M374 221V231M369 226H379M363 66V74M359 70H367"
          stroke="var(--scene-gold)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {isCelebrating && (
          <g className="payday-confetti" strokeWidth="4.5" strokeLinecap="round">
            <path d="M261 29L264 35M373 29L369 36M448 152L453 157" stroke="var(--scene-gold)" />
            <path d="M179 57L173 62M361 100L367 104M251 143L247 149" stroke="var(--scene-coral)" />
            <path d="M294 33L291 40M476 91L481 86M214 153L217 160" stroke="var(--scene-green)" />
          </g>
        )}
      </g>
    </svg>
  );
}
