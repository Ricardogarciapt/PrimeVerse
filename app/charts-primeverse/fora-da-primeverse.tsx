import Image from "next/image"

/**
 * O que vê quem abre os gráficos por fora da comunidade.
 *
 * Não é um formulário: é uma porta com uma seta. A autenticação vive no hub, e
 * é lá que a pessoa entra ou se inscreve — nós não pedimos, nem recebemos, nem
 * reencaminhamos a palavra-passe dela.
 */
export default function ForaDaPrimeverse({ hubUrl }: { hubUrl: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#040507" }}>
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <Image src="/images/image.png" alt="Prime Verse" width={200} height={44} className="h-10 w-auto" priority />
        </div>

        <div className="rounded-2xl border p-6 sm:p-8" style={{ backgroundColor: "#0A0E1A", borderColor: "#015BF930" }}>
          <h1 className="text-xl font-semibold text-white">Charts live inside PrimeVerse</h1>
          <p className="mt-2 text-sm text-slate-400">
            Open them from your PrimeVerse dashboard — you are signed in there already, so there is nothing else to type.
          </p>

          <a
            href={hubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg, #015BF9, #6d3bf5)" }}
          >
            Go to PrimeVerse
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Not a member yet?{" "}
          <a href={hubUrl} target="_blank" rel="noopener noreferrer" className="text-[#5b9dff] hover:underline">
            Join PrimeVerse
          </a>
        </p>
      </div>
    </div>
  )
}
