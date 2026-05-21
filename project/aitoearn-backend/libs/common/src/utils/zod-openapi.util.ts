import type { Type } from '@nestjs/common'
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import type { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory'
import { z } from 'zod'
import { isZodDto } from './zod-dto.util'

export const zodToJsonSchemaOptions: Parameters<typeof z.toJSONSchema>[1] = {
  uri: id => `#/components/schemas/${id}`,
  target: 'draft-7',
  unrepresentable: 'any',
  cycles: 'ref',
  override: (ctx) => {
    const _zod = ctx.zodSchema._zod
    const def = _zod.def
    if (def.type === 'date') {
      ctx.jsonSchema.type = 'string'
      ctx.jsonSchema.format = 'date-time'
    }
  },
}

// 动态获取运行时 SchemaObjectFactory 类以绕过 Node.js package exports 限制
let SchemaObjectFactoryClass: any
try {
  const path = require('path')
  const pkgName = '@nestjs/swagger'
  const swaggerPath = require.resolve(pkgName)
  const factoryPath = path.join(path.dirname(swaggerPath), 'services', 'schema-object-factory')
  SchemaObjectFactoryClass = require(factoryPath).SchemaObjectFactory
} catch (e) {
  // 如果在某些不支持 require 的环境下，可以 fallback
  SchemaObjectFactoryClass = null
}

export function patchNestJsSwagger() {
  const TargetFactory = SchemaObjectFactoryClass
  if (!TargetFactory) {
    console.warn('[patchNestJsSwagger] SchemaObjectFactoryClass not found, skipping patch.')
    return
  }

  if ('__patchedWithLoveByNestjsZod' in TargetFactory.prototype)
    return
  const defaultExplore = TargetFactory.prototype.exploreModelSchema

  TargetFactory.prototype.exploreModelSchema = function (
    this: any,
    type: any,
    schemas: any,
    schemaRefsStack: any,
  ) {
    if (this && this['isLazyTypeFunc'](type)) {
      const factory = type as () => Type<unknown>
      type = factory()
    }

    if (!isZodDto(type)) {
      return defaultExplore.call(this, type, schemas, schemaRefsStack)
    }

    schemas[type.name] = z.toJSONSchema(type.schema, zodToJsonSchemaOptions) as SchemaObject
    return type.name
  }
  TargetFactory.prototype.__patchedWithLoveByNestjsZod = true
}

