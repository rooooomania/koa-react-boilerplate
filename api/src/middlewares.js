/**
 * Created by moriyasei on 2017/02/02.
 */

export const pageNotFound = () => {
    return async (ctx, next) => {
        await next();

        if (404 != ctx.status) return;

        ctx.status = 404;

        switch (ctx.accepts('html', 'json')) {
        case 'html':
            ctx.type = 'html';
            ctx.body = '<p>Page Not Found</p>';
            break;
        case 'json':
            ctx.body = {
                message: 'Page Not Found'
            };
            break;
        default:
            ctx.type = 'text';
            ctx.body = 'Page Not Found';
        }
    };
};
