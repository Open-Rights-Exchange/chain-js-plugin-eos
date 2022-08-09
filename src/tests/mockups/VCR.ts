import nock from 'nock'
import { promises as fs } from 'fs'

type CassetteFile = Record<string, nock.Definition[]>

export async function startVCR(): Promise<void> {
  const defns = await currentCassettes()
  if (!defns) {
    // No cassettes found - recording responses
    nock.recorder.rec({ output_objects: true, dont_print: true })
  } else {
    // Cassettes found - using saved responses
    // set up the mocks
    nock.define(defns)
  }
}

export async function stopVCR() {
  const defns = nock.recorder.play() as nock.Definition[]
  if (defns.length) {
    await saveCassettes(defns)
  }
  nock.restore()
}

function timeString(...args: Parameters<typeof Date>) {
  const date = new Date(...args)
  // the dates returned by this api appear to be iso string formatted but without the Z
  return date.toISOString().replace(/Z$/, '')
}

function cassettePath(): string {
  const state: jest.MatcherState = expect.getState()
  const pathParts = state.testPath.split('/')
  const fileName = pathParts.pop()
  pathParts.push('__cassettes__')
  pathParts.push(fileName.replace(/\..+/, '.cassette.json'))
  return pathParts.join('/')
}

async function writeCassetteFile(cassettes: CassetteFile): Promise<void> {
  console.log('updating cassette file')
  await fs.writeFile(cassettePath(), JSON.stringify(cassettes, null, 2))
}

async function saveCassettes(defns: nock.Definition[]): Promise<void> {
  const cassettes: CassetteFile = await readCassetteFile()
  cassettes[expect.getState().currentTestName] = defns
  await writeCassetteFile(cassettes)
}

async function readCassetteFile(): Promise<CassetteFile> {
  try {
    const buffer = await fs.readFile(cassettePath())
    return JSON.parse(buffer.toString()) as CassetteFile
  } catch {
    // no cassette file
    return {}
  }
}

async function currentCassettes(): Promise<nock.Definition[]> {
  const cassettes = await readCassetteFile()
  return cassettes[expect.getState().currentTestName]
}
