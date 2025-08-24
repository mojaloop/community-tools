import { processFileContent, validateHeaderConfig } from './header-manager'

describe('header-manager', () => {
  describe('validateHeaderConfig', () => {
    it('should validate correct header config', () => {
      const config = {
        template: 'test template',
        startDelimiter: '/*',
        endDelimiter: '*/'
      }

      expect(() => validateHeaderConfig(config)).not.toThrow()
    })

    it('should throw error for missing template', () => {
      const config = {
        startDelimiter: '/*',
        endDelimiter: '*/'
      }

      expect(() => validateHeaderConfig(config as any)).toThrow('template is required')
    })
  })

  describe('processFileContent', () => {
    it('should replace existing header', () => {
      const content = `/*
      Old License
      */
      console.log("test");`
      const config = {
        template: 'License\n--------\nTest License',
        startDelimiter: '/*',
        endDelimiter: '*/'
      }

      const result = processFileContent(content, config)

      expect(result).toContain(config.template)
      expect(result).toContain('console.log("test")')
      expect(result).not.toContain('Old License')
    })
  })
}) 