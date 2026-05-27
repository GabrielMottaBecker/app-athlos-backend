"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentidadeRoutingKey = exports.IdentidadeExchangeName = void 0;
var IdentidadeExchangeName;
(function (IdentidadeExchangeName) {
    IdentidadeExchangeName["USUARIO_CREATED"] = "identidade.usuarios.created.exchange";
    IdentidadeExchangeName["USUARIO_UPDATED"] = "identidade.usuarios.updated.exchange";
    IdentidadeExchangeName["USUARIO_DELETED"] = "identidade.usuarios.deleted.exchange";
    IdentidadeExchangeName["USUARIO_STATUS_CHANGED"] = "identidade.usuarios.status-changed.exchange";
})(IdentidadeExchangeName || (exports.IdentidadeExchangeName = IdentidadeExchangeName = {}));
var IdentidadeRoutingKey;
(function (IdentidadeRoutingKey) {
    IdentidadeRoutingKey["USUARIO_CREATED"] = "usuario.created";
    IdentidadeRoutingKey["USUARIO_UPDATED"] = "usuario.updated";
    IdentidadeRoutingKey["USUARIO_DELETED"] = "usuario.deleted";
    IdentidadeRoutingKey["USUARIO_STATUS_CHANGED"] = "usuario.status-changed";
})(IdentidadeRoutingKey || (exports.IdentidadeRoutingKey = IdentidadeRoutingKey = {}));
//# sourceMappingURL=identidade-events.enum.js.map