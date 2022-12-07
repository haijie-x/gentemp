import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { readFile, readdir, writeFile } from 'fs/promises'
import prompts from 'prompts'
import chalk from 'chalk'
import consola from 'consola'
import { copy, emptyDir, ensureDir, pathExists } from 'fs-extra'

const rawLog = consola.log
const cwd = process.cwd()
const __dirname = fileURLToPath(import.meta.url)

const choose = async (): Promise<{ projectName: string; template: string }> => {
  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'projectName:',
    initial: 'unknown',
  })

  const { template } = await prompts({
    type: 'select',
    name: 'template',
    message: 'template:',
    choices: [
      {
        title: 'Vanilla',
        value: 'Vanilla',
        description: 'Without any web framework & For npm package',
      },
    ],
    initial: 0,
  })
  return {
    projectName,
    template,
  }
}

const check = async (targetDir: string): Promise<Boolean> => {
  rawLog(chalk.blue('Check if folder is empty ...'))

  const isPathExist = await pathExists(targetDir)

  if (!isPathExist) return true

  const files = await readdir(targetDir)

  if (files.length > 0) {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'The target folder is not empty, Do you want to empty it ?',
    })

    if (!confirm) return false
    emptyDir(targetDir)
    return true
  }

  return true
}

const generate = async (targetDir: string, template: string): Promise<Boolean> => {
  rawLog(chalk.blue('Start generate folder ...'))

  await ensureDir(targetDir)

  const fromDir = resolve(__dirname, '../..', `templates/${template}`)

  await copy(fromDir, targetDir)

  return true
}

const replaceJson = (id: string, replaceOption: { projectName: string }) => {
  const { projectName } = replaceOption

  return id.replace('"name": "unknown"', `"name": "${projectName}"`)
}

const handlePkgJson = async (targetDir: string, projectName: string): Promise<void> => {
  const filePath = resolve(targetDir, './package.json')

  writeFile(
    filePath,
    replaceJson(await readFile(filePath, 'utf-8'), {
      projectName,
    }),
  )
}

const run = async () => {
  rawLog(chalk.blue('Welcome to use template generator'))

  const { projectName, template } = await choose()

  const targetDir = resolve(cwd, projectName)

  const isEmpty = await check(targetDir)

  if (!isEmpty) return consola.error(chalk.red('The target folder is not empty, Fail to generate'))

  await generate(targetDir, template)

  await handlePkgJson(targetDir, projectName)

  consola.success(chalk.green('Generate successfully'))
}

run()
