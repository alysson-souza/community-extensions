import {
    SourceManga,
    ChapterDetails,
    PartialSourceManga,
    Tag,
    Chapter
} from '@paperback/types'

import { NHLanguages } from './NHentaiHelper'

import {
    Gallery,
    ImagePageObject,
    QueryResponse,
    TagObject
} from './NHentaiInterfaces'

export const parseMangaDetails = (data: Gallery): SourceManga => {
    const artist = getArtist(data)

    const tags: Tag[] = []
    for (const tag of data.tags) {
        if (tag.type === 'tag')
            tags.push(App.createTag({ id: tag.id.toString(), label: tag.name }))
    }
    
    return App.createSourceManga({
        id: data.id.toString(),
        mangaInfo: App.createMangaInfo({
            titles: [data.title.english, data.title.japanese, data.title.pretty],
            artist: artist,
            author: artist,
            image: `https://t.nhentai.net/galleries/${data.media_id}/cover.${typeOfImage(data.images.cover)}`,
            status: 'Completed',
            tags: [App.createTagSection({ id: 'tags', label: 'Tags', tags: tags })],
            desc: ''
        })
    })
}

export const parseChapters = (data: Gallery, mangaId: string): Chapter => {
    return App.createChapter({
        id: mangaId,
        chapNum: 1,
        name: data.title.english,
        langCode: NHLanguages.getLangCode(getLanguage(data)),
        time: new Date(data.upload_date * 1000)
    })
}

export const parseChapterDetails = (data: Gallery, mangaId: string): ChapterDetails => {
    return App.createChapterDetails({
        id: mangaId,
        mangaId: mangaId,
        pages: data.images.pages.map((image, i) => {
            const type = typeOfImage(image)
            return `https://i.nhentai.net/galleries/${data.media_id}/${i + 1}.${type}`
        })
    })
}

export const parseSearch = (data: QueryResponse): PartialSourceManga[] => {
    const tiles: PartialSourceManga[] = []
    for (const gallery of data.result) {
        tiles.push(App.createPartialSourceManga({
            image: `https://t.nhentai.net/galleries/${gallery.media_id}/cover.${typeOfImage(gallery.images.cover)}`,
            title: gallery.title.pretty,
            mangaId: gallery.id.toString(),
            subtitle: NHLanguages.getName(getLanguage(gallery))
        }))
    }
    return tiles
}

// Utility
const typeMap: { [key: string]: string; } = { 'j': 'jpg', 'p': 'png', 'g': 'gif' }

const typeOfImage = (image: ImagePageObject): string => {
    return typeMap[image.t] ?? ''
}

const getArtist = (gallery: Gallery): string => {
    const tags: TagObject[] = gallery.tags
    for (const tag of tags) {
        if (tag.type === 'artist') {
            return tag.name
        }
    }
    return ''
}

const getLanguage = (gallery: Gallery): string => {
    const tags: TagObject[] = gallery.tags
    for (const tag of tags) {
        if (tag.type === 'language' && tag.name !== 'translated') {
            return tag.name
        }
    }
    return ''
}