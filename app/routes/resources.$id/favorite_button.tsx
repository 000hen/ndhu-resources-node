import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

interface FavoriteButtonArgs {
    isFavorite: boolean,
    onClick: () => void
}

export default function FavoriteButtonComponent(config: FavoriteButtonArgs) {
    return <button className="btn btn-ghost tooltip h-16 sm:ml-2 float-right" data-tip={
        config.isFavorite ? "已收藏資源！" : "收藏此資源"
    } onClick={config.onClick}>
        {!config.isFavorite && <MdFavoriteBorder size={32} />}
        {config.isFavorite && <MdFavorite size={32} className="text-red-500" />}
    </button>;
}