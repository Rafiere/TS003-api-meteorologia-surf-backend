import {Beach, GeoPosition} from "@src/models/beach";
import {ForecastPoint} from "@src/clients/stormGlass";

const waveHeights = {
    ankleToKnee: {
        min: 0.3,
        max: 1.0
    },
    waistHigh: {
        min: 1.0,
        max: 2.0
    },
    headHigh: {
        min: 2.0,
        max: 2.4
    }
}

export class RatingService {

    constructor(private beach: Beach){}

    public getRateForPoint(point: ForecastPoint): number {
        const swellDirection = this.getPositionFromLocation(point.swellDirection); //Essa é a posição da ondulação.
        const windDirection = this.getPositionFromLocation(point.windDirection); //Essa é a posição do vento.
        const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(swellDirection, windDirection);

        const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
        const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);

        const finalRating = (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3; //Calculando a média de cada uma das notas e obtendo a nota final.
        return Math.round(finalRating);
    }

    /**
     * Esse método calculará a nota baseada na posição do vento e das ondas.
     */

    public getRatingBasedOnWindAndWavePositions(wavePosition: GeoPosition, windPosition: GeoPosition): number {

        if(wavePosition === windPosition){
            return 1;
        }else if(this.isWindOffShore(wavePosition, windPosition)){
            return 5;
        }
        return 3;
    }

    /**
     * Esse método calculará a nota com base no período da ondulação. Quanto maior
     * esse período, melhor.
     */

    public getRatingForSwellPeriod(period: number): number {
        if(period >= 7 && period < 10){
            return 2;
        }
        if(period >= 10 && period < 14){
            return 4;
        }
        if(period >= 14){
            return 5;
        }
        return 1;
    }

    /**
     * Esse método calculará uma nota de acordo com o tamanho das ondas (em metros).
     */

    public getRatingForSwellSize(height: number): number {

        if(height >= waveHeights.ankleToKnee.min && height < waveHeights.ankleToKnee.max){
            return 2;
        }

        if(height >= waveHeights.waistHigh.min && height < waveHeights.waistHigh.max){
            return 3;
        }

        if(height >= waveHeights.headHigh.min){
            return 5;
        }

        return 1;
    }

    /**
     * Esse método retornará um ponto cardeal de acordo com as coordenadas
     * que forem passadas para ele.
     */

    public getPositionFromLocation(coordinates: number): GeoPosition{

        if(coordinates >= 310 || (coordinates < 50 && coordinates >= 0)){
            return GeoPosition.N;
        }

        if(coordinates >= 50 && coordinates < 120){
            return GeoPosition.E;
        }

        if(coordinates >= 120 && coordinates < 220){
            return GeoPosition.S;
        }

        if(coordinates >= 220 && coordinates < 310){
            return GeoPosition.W;
        }

        return GeoPosition.E;
    }

    private isWindOffShore(wavePosition: GeoPosition, windPosition: GeoPosition): boolean {
       return (
           (wavePosition === GeoPosition.N && windPosition === GeoPosition.S && this.beach.position === GeoPosition.N) ||
           (wavePosition === GeoPosition.S && windPosition === GeoPosition.N && this.beach.position === GeoPosition.S) ||
           (wavePosition === GeoPosition.E && windPosition === GeoPosition.W && this.beach.position === GeoPosition.E) ||
           (wavePosition === GeoPosition.W && windPosition === GeoPosition.E && this.beach.position === GeoPosition.W)
       );
    }
}