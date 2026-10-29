type PaydaySceneProps = {
  speech: string;
  paydayLabel: string;
  isCelebrating: boolean;
};

export function PaydayScene({ speech, paydayLabel, isCelebrating }: PaydaySceneProps) {
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
        <circle cx="306" cy="158" r="145" fill="none" stroke="var(--scene-line)" strokeDasharray="3 9" />
        <ellipse cx="291" cy="294" rx="171" ry="13" fill="var(--scene-shadow)" />
        <path d="M101 294H469" stroke="var(--scene-line)" strokeWidth="2" strokeLinecap="round" />

        {/* A little clock, a payday calendar, and a daydream. */}
        <g stroke="var(--scene-ink)" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="235" cy="54" r="25" fill="var(--scene-paper)" stroke="var(--scene-line)" />
          <path d="M235 34V37M255 54H252M235 74V71M215 54H218" stroke="var(--scene-line)" />
          <path d="M235 54L227 48" />
          <path className="payday-clock-hand" d="M235 54V39" />
          <circle cx="235" cy="54" r="2" fill="var(--scene-ink)" stroke="none" />
        </g>
        <g className="payday-calendar">
          <rect x="391" y="47" width="70" height="78" rx="12" fill="var(--scene-shadow)" />
          <rect x="387" y="42" width="70" height="78" rx="12" fill="var(--scene-paper)" stroke="var(--scene-line)" />
          <path d="M399 42H445Q457 42 457 54V65H387V54Q387 42 399 42" fill="var(--scene-green)" />
          <path d="M403 36V47M441 36V47" stroke="var(--scene-ink)" strokeWidth="4" strokeLinecap="round" />
          <text x="422" y="58" textAnchor="middle" fontSize="8" fontWeight="600" letterSpacing="1" fill="#fff">
            NGÀY LƯƠNG
          </text>
          <text x="422" y="102" textAnchor="middle" fontSize="29" fontWeight="650" fill="var(--scene-ink)">
            {paydayLabel}
          </text>
        </g>
        <g className="payday-thought">
          <path
            d="M68 91H184Q198 91 198 105V128Q198 142 184 142H162L172 156L146 142H68Q54 142 54 128V105Q54 91 68 91Z"
            fill="var(--scene-paper)"
            stroke="var(--scene-line)"
          />
          <text x="126" y="121" textAnchor="middle" fontSize="12" fontWeight="550" fill="var(--scene-ink)">
            {speech}
          </text>
          <circle cx="185" cy="165" r="4" fill="var(--scene-line)" />
          <circle cx="201" cy="175" r="2.5" fill="var(--scene-line)" />
        </g>

        {/* Plant and coffee table anchor the scene. */}
        <g stroke="var(--scene-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M132 264V215M132 243L114 225M132 235L151 216" fill="none" />
          <path d="M132 224C109 212 118 192 118 192S140 200 132 224Z" fill="var(--scene-leaf)" stroke="none" />
          <path d="M133 237C131 212 157 203 157 203S162 226 133 237Z" fill="var(--scene-green)" stroke="none" />
          <path d="M125 241C102 242 100 218 100 218S124 218 125 241Z" fill="var(--scene-green)" stroke="none" />
        </g>
        <path d="M112 260H151L145 289Q144 294 139 294H124Q119 294 118 289Z" fill="var(--scene-clay)" />
        <rect x="109" y="257" width="45" height="8" rx="3" fill="var(--scene-peach)" />
        <path d="M187 239L179 291M230 239L238 291" stroke="var(--scene-wood)" strokeWidth="6" strokeLinecap="round" />
        <rect x="171" y="231" width="76" height="9" rx="4.5" fill="var(--scene-wood)" />
        <ellipse cx="207" cy="229" rx="19" ry="3" fill="var(--scene-shadow)" />
        <path d="M215 209H221Q230 217 218 223H215" fill="none" stroke="var(--scene-clay)" strokeWidth="4" />
        <path d="M191 205H217V222Q217 229 210 229H198Q191 229 191 222Z" fill="var(--scene-peach)" />
        <ellipse cx="204" cy="205" rx="13" ry="3" fill="var(--scene-clay)" />
        <g fill="none" stroke="var(--scene-steam)" strokeWidth="2" strokeLinecap="round">
          <path className="payday-steam" d="M199 195C192 189 204 184 198 178" />
          <path className="payday-steam payday-steam-delayed" d="M210 194C203 187 215 184 209 176" />
        </g>

        {/* Chair and legs. The front leg gently swings from the knee. */}
        <path d="M290 224L278 290M350 224L367 290" stroke="var(--scene-wood)" strokeWidth="7" strokeLinecap="round" />
        <path d="M336 147H348Q365 147 362 164L354 219H326Z" fill="var(--scene-chair)" />
        <path d="M293 207L271 231L263 277" fill="none" stroke="#3a4b52" strokeWidth="23" strokeLinejoin="round" />
        <path d="M254 274L270 276L269 285H252Z" fill="var(--scene-skin)" />
        <path
          d="M253 281L268 283L274 292Q274 296 269 296H241Q239 289 253 281Z"
          fill="var(--scene-paper)"
          stroke="var(--scene-line)"
        />
        <path d="M242 293H271" stroke="var(--scene-ink)" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M296 199Q308 200 320 209L335 230"
          fill="none"
          stroke="#263b42"
          strokeWidth="27"
          strokeLinecap="round"
        />
        <g className="payday-swinging-leg">
          <path d="M335 230L325 273" stroke="#263b42" strokeWidth="23" strokeLinecap="round" />
          <path d="M317 269L333 272L331 282H315Z" fill="var(--scene-skin)" />
          <path
            d="M316 278L331 281Q334 287 345 289Q349 290 348 296H315Q309 293 316 278Z"
            fill="var(--scene-paper)"
            stroke="var(--scene-line)"
          />
          <path d="M315 293H345M328 284L333 285" stroke="var(--scene-ink)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <rect x="278" y="216" width="79" height="11" rx="5.5" fill="var(--scene-chair)" />

        <g className="payday-body">
          <path
            d="M278 137Q294 128 315 134Q332 138 335 157L329 204Q304 215 276 201L271 163Q268 148 278 137Z"
            fill="var(--scene-green)"
          />
          <path d="M278 189Q303 199 330 191L329 204Q303 214 276 201Z" fill="#267166" />
          <path d="M295 124V137Q304 146 314 134L311 119" fill="var(--scene-skin)" />
          <path d="M296 127Q305 132 312 126V119H297Z" fill="var(--scene-skin-shadow)" />
          <path
            d="M279 150L268 179Q265 185 273 189L292 196"
            fill="none"
            stroke="var(--scene-green)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path d="M282 192L296 198" stroke="var(--scene-skin)" strokeWidth="12" strokeLinecap="round" />
          <path d="M275 155L272 171" stroke="#267166" strokeWidth="2" strokeLinecap="round" />

          <g className="payday-phone-arm">
            <path d="M326 149L340 176" stroke="var(--scene-green)" strokeWidth="20" strokeLinecap="round" />
            <path d="M340 176L357 153" stroke="var(--scene-skin)" strokeWidth="13" strokeLinecap="round" />
            <rect x="348" y="125" width="23" height="38" rx="5" transform="rotate(12 359 144)" fill="#263b42" />
            <path d="M355 131L367 134L362 153L350 150Z" fill="#b6e6d6" />
            <path d="M353 153L356 147" stroke="var(--scene-skin)" strokeWidth="7" strokeLinecap="round" />
            {isCelebrating && (
              <path d="M355 141L358 144L363 138" fill="none" stroke="#267166" strokeWidth="2" strokeLinecap="round" />
            )}
          </g>

          <g className="payday-head">
            <path d="M280 94Q277 68 303 67Q331 67 331 93L326 112L281 108Z" fill="#263b42" />
            <path
              d="M287 86Q304 94 321 83L327 104Q332 108 326 112L321 114Q319 129 305 130Q285 128 283 108Z"
              fill="var(--scene-skin)"
            />
            <ellipse cx="284" cy="105" rx="7" ry="9" fill="var(--scene-skin)" />
            <path
              d="M282 103Q287 100 287 107"
              fill="none"
              stroke="var(--scene-skin-shadow)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M280 96Q274 78 285 73Q283 63 294 65Q307 56 316 66Q338 65 332 82Q322 93 305 86Q293 89 289 98L287 104L283 98Z"
              fill="#263b42"
            />
            <path d="M291 75Q307 69 320 76" fill="none" stroke="#41575d" strokeWidth="3" strokeLinecap="round" />
            <path d="M299 97L305 96M316 95L321 96" stroke="#263b42" strokeWidth="2" strokeLinecap="round" />
            <g className="payday-eyes" fill="#263b42">
              <ellipse cx="303" cy="103" rx="2" ry="2.8" />
              <ellipse cx="319" cy="102" rx="2" ry="2.8" />
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
              fill={isCelebrating ? '#fff8ec' : 'none'}
              stroke="#8f5148"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <ellipse cx="296" cy="112" rx="5" ry="2.5" fill="#ec9e83" opacity="0.6" />
          </g>
        </g>

        <g className="payday-coin">
          <circle cx="405" cy="187" r="16" fill="#efc56d" />
          <circle cx="405" cy="187" r="12" fill="none" stroke="#be8c37" />
          <text x="405" y="193" textAnchor="middle" fontSize="18" fontWeight="600" fill="#805d29">
            ₫
          </text>
        </g>
        <path
          className="payday-sparkle"
          d="M374 221V231M369 226H379M363 66V74M359 70H367"
          stroke="var(--scene-green)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {isCelebrating && (
          <g className="payday-confetti" strokeWidth="5" strokeLinecap="round">
            <path d="M261 29L264 35M373 29L369 36M448 152L453 157" stroke="#e5b757" />
            <path d="M179 57L173 62M361 100L367 104M251 143L247 149" stroke="var(--scene-peach)" />
            <path d="M294 33L291 40M476 91L481 86M214 153L217 160" stroke="var(--scene-green)" />
          </g>
        )}
      </g>
    </svg>
  );
}
