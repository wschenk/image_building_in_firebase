const Jimp = require( 'jimp' )
const Tempfile = require( 'tempfile' )

var maskFile = __dirname+"/results_mask.png";

function applyMask( text, avatarFile ) {
  return Jimp.read( maskFile ).then( (mask) => {
    return Jimp.read( avatarFile ).then( (image) => {
      return Jimp.loadFont( Jimp.FONT_SANS_32_WHITE ).then( (font) => {
        var original = image.clone()
        original.resize( 215, 215 ) // Resize clean avatar to fit in the circle

        image.resize( 480, 480 ) // Resize avatar to fill larger square
        image.blur(5) // Blur it
        image.color( [{ apply: 'darken', params: [60]}] ) // Darken the blurred colors

        // Center point is 238, 275
        // Write the clean avatar into the "center" of the circle
        image.composite( original, 238 - (original.bitmap.width/2), 275 - (original.bitmap.height/2), [Jimp.BLEND_DESTINATION_OVER, 1, 1] )
        // Write the mask on top
        image.composite( mask, 0, 0, [Jimp.BLEND_DESTINATION_OVER, 1, 1])

        // Write the text onto the image fitting it into the box
        // top left 156, 400 and 175 pixel across and 30 down
        image.print( font, 156, 400, {
          text: text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, 175, 30);

        var outputFile = Tempfile( ".png" );
        return image.writeAsync( outputFile ).then( () => { return outputFile} );
      } )
    } )
  } )
}

if( process.argv.slice(-1)[0] === '--test' ) {
  applyMask( "Will S", __dirname+"/avatar.jpg" )
    .then( console.log )
    .catch( console.log )
}

exports.applyMask = applyMask
