

const g = 'scopo global'

function func() {
    const _g = 'scopo local'

    console.log('>>> _g:', _g)
    console.log('>>> g:', g)
    console.log('>>> this.g', this.g)
}

func()